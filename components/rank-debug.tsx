// DEBUG: seletor para visualizar cada rank.
// Para desativar, comente a linha <RankDebugSelect ... /> em components/round-logger.tsx.
// Sem o seletor, o override fica sempre null e o rank real é usado.

import { RANKS, type RankDefinition } from "@/lib/ranks"

type RankDebugSelectProps = {
  value: RankDefinition | null
  onChange: (rank: RankDefinition | null) => void
}

/** Número de treinos simulado (meio do intervalo) para a barra de progresso do preview. */
export function previewWorkouts(rank: RankDefinition): number {
  const max = rank.maxWorkouts ?? rank.minWorkouts + 40
  return rank.minWorkouts + Math.floor((max - rank.minWorkouts) / 2)
}

export function RankDebugSelect({ value, onChange }: RankDebugSelectProps) {
  return (
    <label className="rank-debug">
      DEBUG RANK
      <select
        value={value?.id ?? ""}
        onChange={(event) => onChange(RANKS.find((rank) => rank.id === event.target.value) ?? null)}
      >
        <option value="">Rank real</option>
        {RANKS.map((rank) => (
          <option key={rank.id} value={rank.id}>
            {rank.name} ({rank.minWorkouts}
            {rank.maxWorkouts === null ? "+" : `–${rank.maxWorkouts}`})
          </option>
        ))}
      </select>
    </label>
  )
}
