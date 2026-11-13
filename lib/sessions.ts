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
        type,
        name: "Manoplas — combinações",
        rounds: 5,
        durationMinutes: 3,
        done: false,
        combinations: [
          {
            id: createId(),
            techniques: [presetTechnique("jab"), presetTechnique("cross"), presetTechnique("lead-hook")],
          },
        ],
      }
    case "heavy-bag":
      return { id, type, name: "Saco pesado", rounds: 3, durationMinutes: 3, done: false }
    case "shadowboxing":
      return { id, type, name: "Sombra", rounds: 3, durationMinutes: 3, done: false }
    case "jump-rope":
      return { id, type, name: "Corda", rounds: 1, durationMinutes: 10, done: false }
    case "burpees":
      return { id, type, name: "Burpees", sets: 3, reps: 10, done: false }
    case "sparring":
      return {
        id,
        type,
        name: "Sparring técnico",
        rounds: 3,
        durationMinutes: 3,
        intensity: "light",
        done: false,
      }
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
  if (typeof value.type !== "string" || !exerciseTypes.includes(value.type as ExerciseType)) return false
  if (value.type === "burpees") return typeof value.sets === "number" && typeof value.reps === "number"
  if (value.type === "pad-work") {
    return typeof value.rounds === "number" && typeof value.durationMinutes === "number" && Array.isArray(value.combinations) && value.combinations.every(isCombination)
  }
  if (value.type === "sparring") {
    return typeof value.rounds === "number" && typeof value.durationMinutes === "number" && isIntensity(value.intensity)
  }
  return typeof value.rounds === "number" && typeof value.durationMinutes === "number"
}

export function isSession(value: unknown): value is Session {
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

export const seed: Session[] = [
  {
    id: "s1",
    date: "2026-11-12",
    title: "Muay Thai · técnica e clinch",
    kind: "MUAY THAI",
    notes: "Manter a guarda alta depois do chute. Trabalhar saída pelo lado esquerdo.",
    exercises: [
      {
        id: "e1",
        type: "pad-work",
        name: "Manoplas — combinações",
        rounds: 5,
        durationMinutes: 3,
        done: true,
        combinations: [
          combo("c1", [hit("t1", "Jab"), hit("t2", "Cross"), hit("t3", "Lead Hook"), hit("t4", "Rear Low Kick")]),
          combo("c2", [hit("t5", "Jab"), hit("t6", "Cross"), hit("t7", "Rear Knee")]),
          combo("c3", [hit("t8", "Lead Hook"), hit("t9", "Rear Hook"), hit("t10", "Cross")]),
        ],
      },
      { id: "e2", type: "heavy-bag", name: "Saco pesado", rounds: 4, durationMinutes: 3, done: true },
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
      { id: "e4", type: "jump-rope", name: "Corda", rounds: 1, durationMinutes: 10, done: true },
      { id: "e5", type: "shadowboxing", name: "Sombra — defesa", rounds: 4, durationMinutes: 3, done: true },
    ],
  },
  {
    id: "s3",
    date: "2026-11-08",
    title: "Kickboxing · potência",
    kind: "KICKBOXING",
    exercises: [
      { id: "e6", type: "heavy-bag", name: "Saco pesado", rounds: 6, durationMinutes: 3, done: true },
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
        combinations: [combo("c4", [hit("t11", "Jab"), hit("t12", "Cross"), hit("t13", "Rear Low Kick")])],
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
