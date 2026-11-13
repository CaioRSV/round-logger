import { Activity, Dumbbell, Shield, Swords, Timer, type LucideIcon } from "lucide-react"

import type { ExerciseType } from "@/lib/types"

const icons: Record<ExerciseType, LucideIcon> = {
  "pad-work": Swords,
  "heavy-bag": Dumbbell,
  shadowboxing: Shield,
  "jump-rope": Timer,
  burpees: Activity,
  sparring: Swords,
}

export function ExerciseIcon({ type, size = 15 }: { type: ExerciseType; size?: number }) {
  const Icon = icons[type]
  return <Icon size={size} />
}
