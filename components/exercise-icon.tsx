import { Activity, Dumbbell, HeartPulse, Shield, Swords, Users, type LucideIcon } from "lucide-react"

import type { ExerciseType } from "@/lib/types"

const icons: Record<string, LucideIcon> = {
  "pad-work": Swords,
  clinch: Users,
  "heavy-bag": Dumbbell,
  shadowboxing: Shield,
  cardio: HeartPulse,
  "jump-rope": HeartPulse,
  burpees: Activity,
  sparring: Swords,
}

export function ExerciseIcon({ type, size = 15 }: { type: ExerciseType | string; size?: number }) {
  const Icon = icons[type] ?? Activity
  return <Icon size={size} />
}
