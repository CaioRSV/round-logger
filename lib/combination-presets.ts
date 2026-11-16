import { presetLabel, presetTechnique } from "@/lib/techniques"
import type { Technique } from "@/lib/types"

// Combinações prontas: atalhos para "importar" vários golpes de uma vez
// para dentro da combinação que está sendo montada.
export type CombinationPreset = {
  id: string
  techniques: string[] // ids de golpes em lib/techniques.ts
}

export type CombinationPresetGroup = {
  label: string
  presets: CombinationPreset[]
}

export const strikingCombinationGroups: CombinationPresetGroup[] = [
  {
    label: "Boxe — fundamentos",
    presets: [
      { id: "box-1-1-2", techniques: ["jab", "jab", "direto"] },
      { id: "box-1-2", techniques: ["jab", "direto"] },
      { id: "box-1-2-3", techniques: ["jab", "direto", "cruzado-frente"] },
      { id: "box-1-2-3-2", techniques: ["jab", "direto", "cruzado-frente", "direto"] },
      { id: "box-1-2-3-4", techniques: ["jab", "direto", "cruzado-frente", "cruzado-tras"] },
      { id: "box-1-6-3-2", techniques: ["jab", "uppercut-tras", "cruzado-frente", "direto"] },
      { id: "box-2-3-2", techniques: ["direto", "cruzado-frente", "direto"] },
      { id: "box-5-3-2", techniques: ["uppercut-frente", "cruzado-frente", "direto"] },
      { id: "box-3-6-3", techniques: ["cruzado-frente", "uppercut-tras", "cruzado-frente"] },
      { id: "box-1-2-overhand", techniques: ["jab", "direto", "overhand"] },
    ],
  },
  {
    label: "Boxe — corpo e cabeça",
    presets: [
      { id: "body-1-body3-3", techniques: ["jab", "gancho-corpo-frente", "cruzado-frente"] },
      { id: "body-2-body3-3", techniques: ["direto", "gancho-corpo-frente", "cruzado-frente"] },
      { id: "body-1-2-body3-2", techniques: ["jab", "direto", "gancho-corpo-frente", "direto"] },
      { id: "body-cintura-3-2", techniques: ["soco-linha-cintura", "cruzado-frente", "direto"] },
      { id: "body-3-body4-3", techniques: ["cruzado-frente", "gancho-corpo-tras", "cruzado-frente"] },
    ],
  },
  {
    label: "Defesa e contra-ataque",
    presets: [
      { id: "def-1-2-slip-2", techniques: ["jab", "direto", "esquiva-lateral", "direto"] },
      { id: "def-slip-2-3", techniques: ["esquiva-lateral", "direto", "cruzado-frente"] },
      { id: "def-roll-3-2", techniques: ["pendulo", "cruzado-frente", "direto"] },
      { id: "def-1-2-roll-3", techniques: ["jab", "direto", "pendulo", "cruzado-frente"] },
      { id: "def-pull-2-3", techniques: ["recuo", "direto", "cruzado-frente"] },
      { id: "def-block-3-2", techniques: ["bloqueio-alto", "cruzado-frente", "direto"] },
      { id: "def-1-2-pivot-2", techniques: ["jab", "direto", "saida-lateral", "direto"] },
      { id: "def-check-low", techniques: ["check-chute", "direto", "low-kick-tras"] },
    ],
  },
  {
    label: "Kickboxing",
    presets: [
      { id: "kb-1-2-low", techniques: ["jab", "direto", "low-kick-tras"] },
      { id: "kb-1-2-side", techniques: ["jab", "direto", "chute-lateral"] },
      { id: "kb-1-2-body-kick", techniques: ["jab", "direto", "chute-corpo-tras"] },
      { id: "kb-1-2-3-low", techniques: ["jab", "direto", "cruzado-frente", "low-kick-tras"] },
      { id: "kb-1-2-3-body-kick", techniques: ["jab", "direto", "cruzado-frente", "chute-corpo-tras"] },
      { id: "kb-2-3-low", techniques: ["direto", "cruzado-frente", "low-kick-tras"] },
      { id: "kb-1-2-lead-kick", techniques: ["jab", "direto", "chute-corpo-frente"] },
      { id: "kb-1-2-high", techniques: ["jab", "direto", "high-kick"] },
      { id: "kb-2-lead-high", techniques: ["direto", "high-kick-frente"] },
      { id: "kb-1-calf", techniques: ["jab", "calf-kick"] },
      { id: "kb-1-2-calf-2", techniques: ["jab", "direto", "calf-kick", "direto"] },
      { id: "kb-low-2-3", techniques: ["low-kick-frente", "direto", "cruzado-frente"] },
      { id: "kb-1-2-spin", techniques: ["jab", "direto", "chute-giratorio"] },
      { id: "kb-side-1-2", techniques: ["chute-lateral", "jab", "direto"] },
    ],
  },
  {
    label: "Muay Thai",
    presets: [
      { id: "mt-teep-1-2", techniques: ["teep-frente", "jab", "direto"] },
      { id: "mt-teep-body-kick", techniques: ["teep-frente", "chute-corpo-tras"] },
      { id: "mt-1-2-knee", techniques: ["jab", "direto", "joelhada-tras"] },
      { id: "mt-1-2-elbow", techniques: ["jab", "direto", "cotovelada-frente"] },
      { id: "mt-1-rear-elbow", techniques: ["jab", "cotovelada-tras"] },
      { id: "mt-2-elbow-knee", techniques: ["direto", "cotovelada-frente", "joelhada-tras"] },
      { id: "mt-3-rear-elbow-knee", techniques: ["cruzado-frente", "cotovelada-tras", "joelhada-frente"] },
      { id: "mt-1-2-3-elbow-knee", techniques: ["jab", "direto", "cruzado-frente", "cotovelada-tras", "joelhada-tras"] },
      { id: "mt-check-body-kick", techniques: ["check-chute", "chute-corpo-tras"] },
      { id: "mt-low-2-body-kick", techniques: ["low-kick-tras", "direto", "chute-corpo-tras"] },
      { id: "mt-1-2-teep", techniques: ["jab", "direto", "teep-tras"] },
      { id: "mt-uppercut-elbow", techniques: ["uppercut-tras", "cotovelada-ascendente", "cotovelada-descendente"] },
      { id: "mt-1-2-flying-knee", techniques: ["jab", "direto", "joelhada-voadora"] },
      { id: "mt-1-2-spin-elbow", techniques: ["jab", "direto", "cotovelada-giratoria"] },
    ],
  },
]

export const clinchCombinationGroups: CombinationPresetGroup[] = [
  {
    label: "Clinche — sequências",
    presets: [
      { id: "cl-plum-knee-knee", techniques: ["clinch-plum", "clinch-joelhada-reta", "clinch-joelhada-reta"] },
      { id: "cl-plum-side-knee-elbow", techniques: ["clinch-plum", "clinch-joelhada-lateral", "clinch-cotovelada-curta"] },
      { id: "cl-plum-up-elbow-jump-knee", techniques: ["clinch-plum", "clinch-cotovelada-ascendente", "clinch-joelhada-salto"] },
      { id: "cl-overhook-liver-switch", techniques: ["clinch-overhook", "clinch-joelhada-figado", "clinch-troca-pegada"] },
      { id: "cl-underhook-thigh-sweep", techniques: ["clinch-underhook", "clinch-joelhada-coxa", "clinch-varrida"] },
      { id: "cl-body-shots", techniques: ["clinch-soco-cintura", "clinch-gancho-corpo", "clinch-uppercut-curto"] },
      { id: "cl-switch-side-knee-trip", techniques: ["clinch-troca-pegada", "clinch-joelhada-lateral", "clinch-raspagem"] },
      { id: "cl-overhook-elbow-down", techniques: ["clinch-overhook", "clinch-cotovelada-giratoria", "clinch-cotovelada-descendente"] },
    ],
  },
]

export function getCombinationPresetGroupsForType(exerciseType: string): CombinationPresetGroup[] {
  return exerciseType === "clinch" ? clinchCombinationGroups : strikingCombinationGroups
}

const allCombinationPresets = [...strikingCombinationGroups, ...clinchCombinationGroups].flatMap((group) => group.presets)

export function findCombinationPreset(id: string): CombinationPreset | undefined {
  return allCombinationPresets.find((preset) => preset.id === id)
}

export function describeCombinationPreset(preset: CombinationPreset): string {
  return preset.techniques.map(presetLabel).join(", ")
}

export function combinationPresetTechniques(preset: CombinationPreset): Technique[] {
  return preset.techniques.map(presetTechnique)
}
