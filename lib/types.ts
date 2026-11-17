export const exerciseTypes = [
  "pad-work",
  "clinch",
  "heavy-bag",
  "shadowboxing",
  "cardio",
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
  /** Descanso entre rounds, em segundos (exercícios com rounds). Padrão: 60. */
  restSeconds?: number
  /** Repetir o bloco de rounds X vezes (ex.: 2 para trocar de manopla com o parceiro). Padrão: 1. */
  repeat?: number
}

export type PadWorkExercise = ExerciseBase & {
  type: "pad-work"
  rounds: number
  durationMinutes: number
  combinations: Combination[]
}

export type ClinchExercise = ExerciseBase & {
  type: "clinch"
  rounds: number
  durationMinutes: number
  combinations: Combination[]
}

export type HeavyBagExercise = ExerciseBase & {
  type: "heavy-bag"
  rounds: number
  durationMinutes: number
  combinations: Combination[]
}

export type RoundExercise = ExerciseBase & {
  type: "shadowboxing" | "cardio" | "jump-rope"
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

export type CombinationExercise = PadWorkExercise | ClinchExercise | HeavyBagExercise

export type Exercise = PadWorkExercise | ClinchExercise | HeavyBagExercise | RoundExercise | BurpeesExercise | SparringExercise

export const combinationExerciseTypes = ["pad-work", "clinch", "heavy-bag"] as const

export function hasCombinations(exercise: Exercise): exercise is CombinationExercise {
  return (combinationExerciseTypes as readonly string[]).includes(exercise.type)
}

export type ExerciseTypeCategory = "combination" | "rounds" | "reps" | "sparring"

export type ExerciseTypeDefinition = {
  id: string
  name: string
  description: string
  category: ExerciseTypeCategory
  defaultName: string
  defaultRounds?: number
  defaultDuration?: number
  defaultSets?: number
  defaultReps?: number
  defaultIntensity?: SparringIntensity
  isCustom?: boolean
}

export type Session = {
  id: string
  date: string
  title: string
  kind: Discipline
  notes?: string
  exercises: Exercise[]
}

export type UserProfile = {
  name: string
  subtitle?: string
  avatarUrl?: string
}


/** Exercícios com rounds e tempo (todos menos os de séries/repetições), jogáveis no Timer Play. */
export type TimedExercise = Exclude<Exercise, BurpeesExercise>

export function isTimedExercise(exercise: Exercise): exercise is TimedExercise {
  return exercise.type !== "burpees"
}
