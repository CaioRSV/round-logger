import type { Technique } from "@/lib/types"

export type TechniquePreset = {
  id: string
  label: string
}

export type TechniqueGroup = {
  label: string
  techniques: TechniquePreset[]
}

// Golpes em PT-BR para Manoplas / Striking geral
export const strikingTechniqueGroups: TechniqueGroup[] = [
  {
    label: "Boxe",
    techniques: [
      { id: "jab", label: "Jab" },
      { id: "direto", label: "Direto" },
      { id: "cruzado-frente", label: "Cruzado frontal" },
      { id: "cruzado-tras", label: "Cruzado posterior" },
      { id: "uppercut-frente", label: "Uppercut frontal" },
      { id: "uppercut-tras", label: "Uppercut posterior" },
      { id: "overhand", label: "Overhand (Mata-cobra)" },
      { id: "gancho-corpo-frente", label: "Gancho no corpo (frente)" },
      { id: "gancho-corpo-tras", label: "Gancho no corpo (trás)" },
      { id: "soco-linha-cintura", label: "Direto no corpo (plexo)" },
    ],
  },
  {
    label: "Cotovelos e Joelhos",
    techniques: [
      { id: "cotovelada-frente", label: "Cotovelada frontal" },
      { id: "cotovelada-tras", label: "Cotovelada posterior" },
      { id: "cotovelada-ascendente", label: "Cotovelada ascendente" },
      { id: "cotovelada-descendente", label: "Cotovelada descendente" },
      { id: "cotovelada-giratoria", label: "Cotovelada giratória" },
      { id: "joelhada-frente", label: "Joelhada frontal" },
      { id: "joelhada-tras", label: "Joelhada posterior" },
      { id: "joelhada-voadora", label: "Joelhada voadora" },
    ],
  },
  {
    label: "Chutes",
    techniques: [
      { id: "teep-frente", label: "Teep frontal (perna da frente)" },
      { id: "teep-tras", label: "Teep posterior (perna de trás)" },
      { id: "chute-corpo-frente", label: "Middle kick frontal (corpo)" },
      { id: "chute-corpo-tras", label: "Middle kick posterior (corpo)" },
      { id: "low-kick-frente", label: "Low kick frontal (coxa interna)" },
      { id: "low-kick-tras", label: "Low kick posterior (coxa externa)" },
      { id: "calf-kick", label: "Calf kick (panturrilha)" },
      { id: "high-kick-frente", label: "High kick frontal (cabeça)" },
      { id: "high-kick", label: "High kick posterior (cabeça)" },
      { id: "chute-giratorio", label: "Spinning back kick (giratório)" },
      { id: "chute-lateral", label: "Side kick (perna da frente)" },
    ],
  },
  {
    label: "Defesa e Movimentação",
    techniques: [
      { id: "esquiva-lateral", label: "Esquiva lateral (Slip)" },
      { id: "pendulo", label: "Pêndulo (Roll)" },
      { id: "recuo", label: "Recuo de tronco (Pull back)" },
      { id: "bloqueio-alto", label: "Bloqueio alto" },
      { id: "check-chute", label: "Bloqueio de chute (Check)" },
      { id: "saida-lateral", label: "Saída lateral / Pivô" },
    ],
  },
]

// Golpes específicos para CLINCHE (joelhadas, cotoveladas, socos na linha de cintura, pegadas — sem chutes na cabeça)
export const clinchTechniqueGroups: TechniqueGroup[] = [
  {
    label: "Joelhos no Clinche",
    techniques: [
      { id: "clinch-joelhada-reta", label: "Joelhada reta no plexo" },
      { id: "clinch-joelhada-lateral", label: "Joelhada curva / lateral (costela)" },
      { id: "clinch-joelhada-figado", label: "Joelhada no fígado" },
      { id: "clinch-joelhada-coxa", label: "Joelhada na coxa" },
      { id: "clinch-joelhada-salto", label: "Joelhada com salto curto" },
    ],
  },
  {
    label: "Cotovelos no Clinche",
    techniques: [
      { id: "clinch-cotovelada-curta", label: "Cotovelada curta horizontal" },
      { id: "clinch-cotovelada-ascendente", label: "Cotovelada ascendente no queixo" },
      { id: "clinch-cotovelada-descendente", label: "Cotovelada descendente (topo)" },
      { id: "clinch-cotovelada-giratoria", label: "Cotovelada giratória curta" },
    ],
  },
  {
    label: "Socos Curtos no Corpo",
    techniques: [
      { id: "clinch-soco-cintura", label: "Direto curto no corpo" },
      { id: "clinch-gancho-corpo", label: "Gancho curto no corpo" },
      { id: "clinch-uppercut-curto", label: "Uppercut curto por dentro" },
    ],
  },
  {
    label: "Pegadas, Controle e Desequilíbrios",
    techniques: [
      { id: "clinch-plum", label: "Puxada de nuca (Plum tailandês)" },
      { id: "clinch-overhook", label: "Travamento de braço (Overhook)" },
      { id: "clinch-underhook", label: "Esgrima de braço (Underhook)" },
      { id: "clinch-troca-pegada", label: "Troca de pegada / Saída lateral" },
      { id: "clinch-varrida", label: "Varrida / Desequilíbrio de clinche" },
      { id: "clinch-raspagem", label: "Raspagem curta de perna" },
    ],
  },
]

export const techniqueGroups = strikingTechniqueGroups

const allPresets = [
  ...strikingTechniqueGroups.flatMap((group) => group.techniques),
  ...clinchTechniqueGroups.flatMap((group) => group.techniques),
  // Mapeamentos legados em inglês para retrocompatibilidade
  { id: "cross", label: "Direto" },
  { id: "lead-hook", label: "Cruzado frontal" },
  { id: "rear-hook", label: "Cruzado posterior" },
  { id: "lead-uppercut", label: "Uppercut frontal" },
  { id: "rear-uppercut", label: "Uppercut posterior" },
  { id: "lead-elbow", label: "Cotovelada frontal" },
  { id: "rear-elbow", label: "Cotovelada posterior" },
  { id: "lead-knee", label: "Joelhada frontal" },
  { id: "rear-knee", label: "Joelhada posterior" },
  { id: "lead-roundhouse", label: "Middle kick frontal (corpo)" },
  { id: "rear-roundhouse", label: "Middle kick posterior (corpo)" },
  { id: "lead-low-kick", label: "Low kick frontal" },
  { id: "rear-low-kick", label: "Low kick posterior" },
  { id: "teep", label: "Teep frontal (perna da frente)" },
]

export function getTechniqueGroupsForType(exerciseType: string): TechniqueGroup[] {
  if (exerciseType === "clinch") {
    return clinchTechniqueGroups
  }
  return strikingTechniqueGroups
}

/** Id do preset cujo rótulo é exatamente este (usado para encurtar links compartilhados). */
export function presetIdForLabel(label: string): string | undefined {
  return allPresets.find((item) => item.label === label)?.id
}

export function presetLabel(id: string): string {
  return allPresets.find((item) => item.id === id)?.label ?? id
}

export function presetTechnique(id: string): Technique {
  const preset = allPresets.find((item) => item.id === id)
  if (!preset) return { id: crypto.randomUUID(), label: id }
  return { id: crypto.randomUUID(), label: preset.label }
}

export function customTechnique(label: string): Technique {
  return { id: crypto.randomUUID(), label: label.trim(), custom: true }
}
