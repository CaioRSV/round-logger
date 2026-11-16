import type { Combination, Exercise, ExerciseType, SessionStatus, SparringIntensity } from "@/lib/types"
import { hasCombinations } from "@/lib/types"

export const exerciseTypeLabels: Record<string, string> = {
  "pad-work": "Manoplas",
  clinch: "Clinche",
  "heavy-bag": "Saco pesado",
  shadowboxing: "Sombra",
  cardio: "Cardio",
  "jump-rope": "Cardio",
  burpees: "Burpees",
  sparring: "Sparring",
}

export function getExerciseTypeLabel(type: string, fallbackName?: string): string {
  return exerciseTypeLabels[type] ?? fallbackName ?? type
}

export const intensityLabels: Record<SparringIntensity, string> = {
  point: "Ponto",
  light: "Leve",
  medium: "Médio",
  hard: "Forte",
}

export const statusLabels: Record<SessionStatus, string> = {
  complete: "Concluídos",
  partial: "Parciais",
  planned: "Planejados",
}

export function formatCombo(combination: Combination): string {
  return combination.techniques.map((technique) => technique.label).join(" → ")
}

export function formatVolume(exercise: Exercise): string {
  if (exercise.type === "burpees") return `${exercise.sets} × ${exercise.reps} reps`
  const unit = exercise.rounds === 1 ? "round" : "rounds"
  return `${exercise.rounds} ${unit} · ${exercise.durationMinutes} min`
}

export function formatDetail(exercise: Exercise): string {
  const volume = formatVolume(exercise)
  if (exercise.type === "sparring") return `${volume} · ${intensityLabels[exercise.intensity]}`
  if (hasCombinations(exercise) && exercise.combinations.length > 0) {
    const count = exercise.combinations.length
    return `${volume} · ${count} ${count === 1 ? "combo" : "combos"}`
  }
  return volume
}
