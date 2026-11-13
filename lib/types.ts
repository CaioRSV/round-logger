export const exerciseTypes = [
  "pad-work",
  "heavy-bag",
  "shadowboxing",
  "jump-rope",
  "burpees",
  "sparring",
] as const

export type ExerciseType = (typeof exerciseTypes)[number]

export const sparringIntensities = ["point", "light", "medium", "hard"] as const

export type SparringIntensity = (typeof sparringIntensities)[number]

export const disciplines = ["BOXE", "MUAY THAI", "KICKBOXING", "MMA", "SPARRING", "TREINO"] as const

export type Discipline = (typeof disciplines)[number]

export type SessionStatus = "planned" | "partial" | "complete"

export type Technique = {
  id: string
  label: string
  custom?: boolean
}

export type Combination = {
  id: string
  techniques: Technique[]
}

type ExerciseBase = {
  id: string
  name: string
  notes?: string
  done: boolean
}

export type PadWorkExercise = ExerciseBase & {
  type: "pad-work"
  rounds: number
  durationMinutes: number
  combinations: Combination[]
}

export type RoundExercise = ExerciseBase & {
  type: "heavy-bag" | "shadowboxing" | "jump-rope"
  rounds: number
  durationMinutes: number
}

export type BurpeesExercise = ExerciseBase & {
  type: "burpees"
  sets: number
  reps: number
}

export type SparringExercise = ExerciseBase & {
  type: "sparring"
  rounds: number
  durationMinutes: number
  intensity: SparringIntensity
}

export type Exercise = PadWorkExercise | RoundExercise | BurpeesExercise | SparringExercise

export type Session = {
  id: string
  date: string
  title: string
  kind: Discipline
  notes?: string
  exercises: Exercise[]
}
