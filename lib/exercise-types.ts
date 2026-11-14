import type { ExerciseTypeDefinition } from "@/lib/types"

export const defaultExerciseTypes: ExerciseTypeDefinition[] = [
  {
    id: "pad-work",
    name: "Manoplas",
    description: "Sequências de golpes técnicos nas manoplas com treinador.",
    category: "combination",
    defaultName: "Manoplas — combinações",
    defaultRounds: 5,
    defaultDuration: 3,
  },
  {
    id: "clinch",
    name: "Clinche",
    description: "Luta agarrada em pé: controle de nuca, joelhadas, cotoveladas e desequilíbrios.",
    category: "combination",
    defaultName: "Clinche — pegada e joelhos",
    defaultRounds: 4,
    defaultDuration: 3,
  },
  {
    id: "heavy-bag",
    name: "Saco pesado",
    description: "Volume de golpes, potência, ritmo e condicionamento em rounds.",
    category: "rounds",
    defaultName: "Saco pesado",
    defaultRounds: 3,
    defaultDuration: 3,
  },
  {
    id: "shadowboxing",
    name: "Sombra",
    description: "Golpes e movimentação no vazio com foco em forma, esquiva e ritmo.",
    category: "rounds",
    defaultName: "Sombra",
    defaultRounds: 3,
    defaultDuration: 3,
  },
  {
    id: "cardio",
    name: "Cardio",
    description: "Pular corda, corrida ou tiros para condicionamento cardiovascular e pés leves.",
    category: "rounds",
    defaultName: "Cardio",
    defaultRounds: 1,
    defaultDuration: 10,
  },
  {
    id: "burpees",
    name: "Burpees",
    description: "Exercício funcional e calistênico explosivo com séries e repetições.",
    category: "reps",
    defaultName: "Burpees",
    defaultSets: 3,
    defaultReps: 10,
  },
  {
    id: "sparring",
    name: "Sparring",
    description: "Combate simulado sob intensidade e regras técnicas ou livres definidas.",
    category: "sparring",
    defaultName: "Sparring técnico",
    defaultRounds: 3,
    defaultDuration: 3,
    defaultIntensity: "light",
  },
]

const STORAGE_KEY = "round-logger.exercise-types.v1"

export function loadExerciseTypes(): ExerciseTypeDefinition[] {
  if (typeof window === "undefined") return defaultExerciseTypes
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultExerciseTypes
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultExerciseTypes
    const valid = parsed.filter(
      (item): item is ExerciseTypeDefinition =>
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.description === "string" &&
        ["combination", "rounds", "reps", "sparring"].includes(item.category),
    )
    if (valid.length === 0) return defaultExerciseTypes
    return valid
  } catch {
    return defaultExerciseTypes
  }
}

export function saveExerciseTypes(types: ExerciseTypeDefinition[]): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(types))
}

export function resetExerciseTypes(): ExerciseTypeDefinition[] {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY)
  }
  return defaultExerciseTypes
}
