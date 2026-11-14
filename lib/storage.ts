import { loadExerciseTypes, saveExerciseTypes } from "@/lib/exercise-types"
import { createId, isSession } from "@/lib/sessions"
import type { ExerciseTypeDefinition, Session, UserProfile } from "@/lib/types"

const SESSIONS_STORAGE_KEY = "round-logger.sessions.v1"
const PROFILE_STORAGE_KEY = "round-logger.profile.v1"

export const defaultProfile: UserProfile = {
  name: "Meu espaço",
  subtitle: "Log pessoal",
}

export interface BackupData {
  app: "round-logger"
  version: 1
  exportedAt: string
  sessions: Session[]
  exerciseTypes?: ExerciseTypeDefinition[]
  profile?: UserProfile
}

export function loadProfile(): UserProfile {
  if (typeof window === "undefined") return defaultProfile
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY)
    if (!raw) return defaultProfile
    const parsed: unknown = JSON.parse(raw)
    if (parsed && typeof parsed === "object" && typeof (parsed as UserProfile).name === "string") {
      const p = parsed as UserProfile
      return {
        name: p.name.trim() || defaultProfile.name,
        subtitle: p.subtitle?.trim() || defaultProfile.subtitle,
        avatarUrl: p.avatarUrl,
      }
    }
    return defaultProfile
  } catch {
    return defaultProfile
  }
}

export function saveProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
}

export function loadSessions(): Session[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(SESSIONS_STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isSession)
  } catch {
    return []
  }
}

export function saveSessions(sessions: Session[]): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions))
}

export function clearAllSessions(): void {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(SESSIONS_STORAGE_KEY)
}

export function findStoredSession(id: string): Session | null {
  return loadSessions().find((session) => session.id === id) ?? null
}

export function copySessionToCalendar(source: Session, targetDate: string): Session {
  const newSession: Session = {
    ...structuredClone(source),
    id: createId(),
    date: targetDate,
    exercises: source.exercises.map((exercise) => ({
      ...structuredClone(exercise),
      id: createId(),
      done: false, // Reset completion so user can perform and track it themselves
    })),
  }

  const existing = loadSessions()
  const updated = [newSession, ...existing.filter((s) => s.id !== newSession.id)]
  saveSessions(updated)
  return newSession
}

export function exportBackupData(): BackupData {
  return {
    app: "round-logger",
    version: 1,
    exportedAt: new Date().toISOString(),
    sessions: loadSessions(),
    exerciseTypes: loadExerciseTypes(),
    profile: loadProfile(),
  }
}

export function downloadBackupFile(): void {
  if (typeof window === "undefined") return
  const data = exportBackupData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const todayStr = new Date().toISOString().split("T")[0]
  const link = document.createElement("a")
  link.href = url
  link.download = `round-logger-backup-${todayStr}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export interface ImportResult {
  success: boolean
  sessionsCount: number
  exerciseTypesCount: number
  profileUpdated?: boolean
  message: string
}

export function importBackupData(rawText: string): ImportResult {
  try {
    const parsed: unknown = JSON.parse(rawText)
    if (!parsed || typeof parsed !== "object") {
      return { success: false, sessionsCount: 0, exerciseTypesCount: 0, message: "Arquivo JSON inválido." }
    }

    let sessionsToImport: Session[] = []
    let typesToImport: ExerciseTypeDefinition[] | null = null
    let profileToImport: UserProfile | null = null

    // Support both wrapped backup format and raw array of sessions
    if (Array.isArray(parsed)) {
      sessionsToImport = parsed.filter(isSession)
    } else {
      const backup = parsed as Partial<BackupData>
      if (Array.isArray(backup.sessions)) {
        sessionsToImport = backup.sessions.filter(isSession)
      }
      if (Array.isArray(backup.exerciseTypes)) {
        typesToImport = backup.exerciseTypes.filter(
          (item): item is ExerciseTypeDefinition =>
            typeof item === "object" &&
            item !== null &&
            typeof item.id === "string" &&
            typeof item.name === "string" &&
            typeof item.description === "string" &&
            ["combination", "rounds", "reps", "sparring"].includes(item.category),
        )
      }
      if (backup.profile && typeof backup.profile.name === "string") {
        profileToImport = backup.profile
      }
    }

    if (sessionsToImport.length === 0 && (!typesToImport || typesToImport.length === 0) && !profileToImport) {
      return {
        success: false,
        sessionsCount: 0,
        exerciseTypesCount: 0,
        message: "Nenhum dado válido de treino ou perfil encontrado no arquivo.",
      }
    }

    // Merge or replace sessions
    const existing = loadSessions()
    const sessionMap = new Map<string, Session>()
    existing.forEach((s) => sessionMap.set(s.id, s))
    sessionsToImport.forEach((s) => sessionMap.set(s.id, s))
    const mergedSessions = Array.from(sessionMap.values())
    saveSessions(mergedSessions)

    // If exercise types are present, save them
    let typesCount = 0
    if (typesToImport && typesToImport.length > 0) {
      saveExerciseTypes(typesToImport)
      typesCount = typesToImport.length
    }

    // If profile is present, save it
    let profileUpdated = false
    if (profileToImport) {
      saveProfile(profileToImport)
      profileUpdated = true
    }

    return {
      success: true,
      sessionsCount: sessionsToImport.length,
      exerciseTypesCount: typesCount,
      profileUpdated,
      message: `Importado com sucesso: ${sessionsToImport.length} treino(s)${typesCount > 0 ? ` e ${typesCount} tipo(s) de exercício` : ""}${profileUpdated ? " e perfil do usuário" : ""}.`,
    }
  } catch (error) {
    return {
      success: false,
      sessionsCount: 0,
      exerciseTypesCount: 0,
      message: `Erro ao processar arquivo: ${error instanceof Error ? error.message : "formato incorreto"}`,
    }
  }
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ""
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

function base64UrlToBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/")
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4)
  const binary = atob(padded)
  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

export function encodeSharePayload(session: Session): string {
  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(session)))
}

export function decodeSharePayload(payload: string): Session | null {
  try {
    const parsed: unknown = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload)))
    return isSession(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function sharePath(session: Session): string {
  return `/share/${session.id}#${encodeSharePayload(session)}`
}
