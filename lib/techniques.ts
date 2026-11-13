import type { Technique } from "@/lib/types"

export type TechniquePreset = {
  id: string
  label: string
}

export const techniqueGroups: { label: string; techniques: TechniquePreset[] }[] = [
  {
    label: "Boxe",
    techniques: [
      { id: "jab", label: "Jab" },
      { id: "cross", label: "Cross" },
      { id: "lead-hook", label: "Lead Hook" },
      { id: "rear-hook", label: "Rear Hook" },
      { id: "lead-uppercut", label: "Lead Uppercut" },
      { id: "rear-uppercut", label: "Rear Uppercut" },
      { id: "overhand", label: "Overhand" },
      { id: "lead-body-hook", label: "Lead Body Hook" },
      { id: "rear-body-hook", label: "Rear Body Hook" },
    ],
  },
  {
    label: "Cotovelos e joelhos",
    techniques: [
      { id: "lead-elbow", label: "Lead Elbow" },
      { id: "rear-elbow", label: "Rear Elbow" },
      { id: "lead-knee", label: "Lead Knee" },
      { id: "rear-knee", label: "Rear Knee" },
      { id: "flying-knee", label: "Flying Knee" },
    ],
  },
  {
    label: "Chutes",
    techniques: [
      { id: "teep", label: "Teep / Front Kick" },
      { id: "lead-teep", label: "Lead Teep" },
      { id: "rear-teep", label: "Rear Teep" },
      { id: "lead-roundhouse", label: "Lead Roundhouse" },
      { id: "rear-roundhouse", label: "Rear Roundhouse" },
      { id: "lead-low-kick", label: "Lead Low Kick" },
      { id: "rear-low-kick", label: "Rear Low Kick" },
      { id: "body-kick", label: "Body Kick" },
      { id: "head-kick", label: "Head Kick" },
      { id: "question-mark-kick", label: "Question Mark Kick" },
      { id: "spinning-back-kick", label: "Spinning Back Kick" },
    ],
  },
]

const presets = techniqueGroups.flatMap((group) => group.techniques)

export function presetTechnique(id: string): Technique {
  const preset = presets.find((item) => item.id === id)
  if (!preset) return { id: crypto.randomUUID(), label: id }
  return { id: crypto.randomUUID(), label: preset.label }
}

export function customTechnique(label: string): Technique {
  return { id: crypto.randomUUID(), label: label.trim(), custom: true }
}
