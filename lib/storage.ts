import { isSession, seed } from "@/lib/sessions"
import type { Session } from "@/lib/types"

const STORAGE_KEY = "round-logger.sessions.v1"

function cloneSessions(sessions: Session[]): Session[] {
  return structuredClone(sessions)
}

export function loadSessions(): Session[] {
  if (typeof window === "undefined") return cloneSessions(seed)
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return cloneSessions(seed)
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return cloneSessions(seed)
    const sessions = parsed.filter(isSession)
    if (parsed.length > 0 && sessions.length === 0) return cloneSessions(seed)
    return sessions
  } catch {
    return cloneSessions(seed)
  }
}

export function saveSessions(sessions: Session[]): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
}

export function findStoredSession(id: string): Session | null {
  return loadSessions().find((session) => session.id === id) ?? null
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
