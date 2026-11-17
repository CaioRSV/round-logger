import { dateKey, startOfWeek, addDays } from "@/lib/dates"
import { presetTechnique } from "@/lib/techniques"
import type {
  Combination,
  Discipline,
  Exercise,
  ExerciseType,
  Session,
  SessionStatus,
  SparringIntensity,
  Technique,
} from "@/lib/types"
import { disciplines, exerciseTypes, sparringIntensities } from "@/lib/types"

export function createId(): string {
  return crypto.randomUUID()
}

export function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction
  if (target < 0 || target >= items.length) return items
  const next = items.slice()
  const [item] = next.splice(index, 1)
  if (item === undefined) return items
  next.splice(target, 0, item)
  return next
}

export function clampCount(value: string, max = 99): number {
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed)) return 1
  return Math.min(max, Math.max(1, parsed))
}

function hit(id: string, label: string): Technique {
  return { id, label }
}

function combo(id: string, techniques: Technique[]): Combination {
  return { id, techniques }
}

export function createExercise(type: ExerciseType): Exercise {
  const id = createId()
  switch (type) {
    case "pad-work":
      return {
        id,
        type: "pad-work",
        name: "Manoplas — combinações",
        rounds: 5,
        durationMinutes: 3,
        done: false,
        combinations: [
          {
            id: createId(),
            techniques: [presetTechnique("jab"), presetTechnique("direto"), presetTechnique("cruzado-frente")],
          },
        ],
      }
    case "clinch":
      return {
        id,
        type: "clinch",
        name: "Clinche — pegada e joelhos",
        rounds: 4,
        durationMinutes: 3,
        done: false,
        combinations: [
          {
            id: createId(),
            techniques: [
              presetTechnique("clinch-plum"),
              presetTechnique("clinch-joelhada-reta"),
              presetTechnique("clinch-cotovelada-curta"),
            ],
          },
        ],
      }
    case "heavy-bag":
      return { id, type: "heavy-bag", name: "Saco pesado", rounds: 3, durationMinutes: 3, done: false, combinations: [] }
    case "shadowboxing":
      return { id, type: "shadowboxing", name: "Sombra", rounds: 3, durationMinutes: 3, done: false }
    case "cardio":
    case "jump-rope":
      return { id, type: "cardio", name: "Cardio", rounds: 1, durationMinutes: 10, done: false }
    case "burpees":
      return { id, type: "burpees", name: "Burpees", sets: 3, reps: 10, done: false }
    case "sparring":
      return {
        id,
        type: "sparring",
        name: "Sparring técnico",
        rounds: 3,
        durationMinutes: 3,
        intensity: "light",
        done: false,
      }
    default:
      return { id, type, name: "Exercício", rounds: 3, durationMinutes: 3, done: false }
  }
}

export function getStatus(session: Pick<Session, "exercises">): SessionStatus {
  const total = session.exercises.length
  const done = session.exercises.filter((exercise) => exercise.done).length
  if (total === 0 || done === 0) return "planned"
  if (done === total) return "complete"
  return "partial"
}

export function countsAsActivity(session: Session): boolean {
  return getStatus(session) !== "planned"
}

export function activityOn(sessions: Session[], date: string): number {
  return sessions.filter((session) => session.date === date && countsAsActivity(session)).length
}

export function sessionsThisWeek(sessions: Session[], today: Date): number {
  const start = dateKey(startOfWeek(today))
  const end = dateKey(addDays(startOfWeek(today), 6))
  return sessions.filter((session) => countsAsActivity(session) && session.date >= start && session.date <= end).length
}

export function trainingStreak(sessions: Session[], today: Date): number {
  const active = new Set(sessions.filter(countsAsActivity).map((session) => session.date))
  let cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  if (!active.has(dateKey(cursor))) cursor = addDays(cursor, -1)
  let streak = 0
  while (active.has(dateKey(cursor))) {
    streak += 1
    cursor = addDays(cursor, -1)
  }
  return streak
}

export function trainingDaysInMonth(sessions: Session[], month: Date): number {
  const prefix = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`
  return new Set(
    sessions.filter((session) => countsAsActivity(session) && session.date.startsWith(prefix)).map((session) => session.date),
  ).size
}

export function nextPlannedSession(sessions: Session[], today: string): Session | undefined {
  return sessions
    .filter((session) => getStatus(session) === "planned" && session.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isTechnique(value: unknown): value is Technique {
  return isRecord(value) && typeof value.id === "string" && typeof value.label === "string" && value.label.trim().length > 0
}

function isCombination(value: unknown): value is Combination {
  return isRecord(value) && typeof value.id === "string" && Array.isArray(value.techniques) && value.techniques.every(isTechnique)
}

function isIntensity(value: unknown): value is SparringIntensity {
  return typeof value === "string" && sparringIntensities.includes(value as SparringIntensity)
}

function isDiscipline(value: unknown): value is Discipline {
  return typeof value === "string" && disciplines.includes(value as Discipline)
}

export function isExercise(value: unknown): value is Exercise {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.name !== "string" || typeof value.done !== "boolean") {
    return false
  }
  if (typeof value.type !== "string") return false
  if (value.type === "burpees") return typeof value.sets === "number" && typeof value.reps === "number"
  if (value.type === "pad-work" || value.type === "clinch") {
    return typeof value.rounds === "number" && typeof value.durationMinutes === "number" && Array.isArray(value.combinations) && value.combinations.every(isCombination)
  }
  if (value.type === "heavy-bag") {
    // Saco pesado antigo não tinha combinações; normalizeSession preenche com [].
    return (
      typeof value.rounds === "number" &&
      typeof value.durationMinutes === "number" &&
      (value.combinations === undefined || (Array.isArray(value.combinations) && value.combinations.every(isCombination)))
    )
  }
  if (value.type === "sparring") {
    return typeof value.rounds === "number" && typeof value.durationMinutes === "number" && isIntensity(value.intensity)
  }
  return typeof value.rounds === "number" && typeof value.durationMinutes === "number"
}

function isRawSession(value: unknown): value is Session {
  if (!isRecord(value)) return false
  return (
    typeof value.id === "string" &&
    typeof value.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value.date) &&
    typeof value.title === "string" &&
    isDiscipline(value.kind) &&
    Array.isArray(value.exercises) &&
    value.exercises.every(isExercise)
  )
}

/** Garante campos adicionados em versões mais novas (ex.: combinações no Saco pesado). */
export function normalizeSession(session: Session): Session {
  return {
    ...session,
    exercises: session.exercises.map((exercise) => {
      const next = exercise.type === "heavy-bag" && !Array.isArray(exercise.combinations) ? { ...exercise, combinations: [] } : { ...exercise }
      // Campos opcionais do Timer Play: descarta valores inválidos vindos de backups antigos/editados.
      if (typeof next.restSeconds !== "number" || !Number.isFinite(next.restSeconds)) delete next.restSeconds
      if (typeof next.repeat !== "number" || !Number.isInteger(next.repeat) || next.repeat < 1) delete next.repeat
      return next
    }),
  }
}

/** Valida e normaliza dados vindos de fora (localStorage, backup, link compartilhado). */
export function parseSessions(values: unknown[]): Session[] {
  return values.filter(isRawSession).map(normalizeSession)
}

export function parseSession(value: unknown): Session | null {
  return isRawSession(value) ? normalizeSession(value) : null
}

export const seed: Session[] = [
  {
    id: "s1",
    date: "2026-11-12",
    title: "Muay Thai · técnica e clinche",
    kind: "MUAY THAI",
    notes: "Manter a guarda alta depois do chute. Trabalhar saída pelo lado esquerdo e postura ereta no clinche.",
    exercises: [
      {
        id: "e1",
        type: "pad-work",
        name: "Manoplas — combinações",
        rounds: 5,
        durationMinutes: 3,
        done: true,
        combinations: [
          combo("c1", [hit("t1", "Jab"), hit("t2", "Direto"), hit("t3", "Cruzado frontal"), hit("t4", "Low kick posterior")]),
          combo("c2", [hit("t5", "Jab"), hit("t6", "Direto"), hit("t7", "Joelhada posterior")]),
          combo("c3", [hit("t8", "Cruzado frontal"), hit("t9", "Cruzado posterior"), hit("t10", "Direto")]),
        ],
      },
      {
        id: "e-clinch-1",
        type: "clinch",
        name: "Clinche — pegada e joelhos",
        rounds: 3,
        durationMinutes: 3,
        done: true,
        combinations: [
          combo("c-clinch-1", [
            hit("t-c1", "Puxada de nuca (Plum)"),
            hit("t-c2", "Joelhada reta no plexo"),
            hit("t-c3", "Cotovelada curta horizontal"),
          ]),
          combo("c-clinch-2", [
            hit("t-c4", "Travamento de braço"),
            hit("t-c5", "Direto curto no corpo"),
            hit("t-c6", "Joelhada na costela"),
          ]),
        ],
        notes: "Postura ereta. Fechar cotovelos para proteger as costelas.",
      },
      {
        id: "e2",
        type: "heavy-bag",
        name: "Saco pesado",
        rounds: 4,
        durationMinutes: 3,
        done: true,
        combinations: [
          combo("c-bag-1", [hit("t-b1", "Jab"), hit("t-b2", "Direto"), hit("t-b3", "Low kick posterior (coxa externa)")]),
          combo("c-bag-2", [hit("t-b4", "Teep frontal (perna da frente)"), hit("t-b5", "Middle kick posterior (corpo)")]),
        ],
      },
      {
        id: "e3",
        type: "sparring",
        name: "Sparring técnico",
        rounds: 3,
        durationMinutes: 2,
        intensity: "light",
        done: false,
        notes: "Foco em defesa. Sem chutes na cabeça.",
      },
    ],
  },
  {
    id: "s2",
    date: "2026-11-10",
    title: "Boxe · volume e defesa",
    kind: "BOXE",
    exercises: [
      { id: "e4", type: "cardio", name: "Cardio — corda e tiros", rounds: 1, durationMinutes: 10, done: true },
      { id: "e5", type: "shadowboxing", name: "Sombra — defesa", rounds: 4, durationMinutes: 3, done: true },
    ],
  },
  {
    id: "s3",
    date: "2026-11-08",
    title: "Kickboxing · potência",
    kind: "KICKBOXING",
    exercises: [
      {
        id: "e6",
        type: "heavy-bag",
        name: "Saco pesado",
        rounds: 6,
        durationMinutes: 3,
        done: true,
        combinations: [
          combo("c-bag-3", [hit("t-b6", "Jab"), hit("t-b7", "Direto"), hit("t-b8", "Side kick (perna da frente)")]),
        ],
      },
      { id: "e7", type: "burpees", name: "Burpees", sets: 4, reps: 12, done: true },
    ],
  },
  {
    id: "s4",
    date: "2026-11-05",
    title: "Muay Thai · fundamentos",
    kind: "MUAY THAI",
    exercises: [
      {
        id: "e8",
        type: "pad-work",
        name: "Manoplas",
        rounds: 5,
        durationMinutes: 3,
        done: true,
        combinations: [combo("c4", [hit("t11", "Jab"), hit("t12", "Direto"), hit("t13", "Low kick posterior")])],
      },
    ],
  },
  {
    id: "s5",
    date: "2026-11-14",
    title: "Sparring aberto",
    kind: "SPARRING",
    exercises: [
      {
        id: "e9",
        type: "sparring",
        name: "Sparring técnico",
        rounds: 5,
        durationMinutes: 3,
        intensity: "medium",
        done: false,
        notes: "Boxe e chutes no corpo. Troca a cada round.",
      },
    ],
  },
]
