"use client"

import { Plus, X } from "lucide-react"
import { useState } from "react"

import { ExerciseIcon } from "@/components/exercise-icon"
import type { ExerciseTypeCategory, ExerciseTypeDefinition } from "@/lib/types"

type ExerciseTypeDialogProps = {
  definition?: ExerciseTypeDefinition
  onClose: () => void
  onSave: (definition: ExerciseTypeDefinition) => void
}

const categories: { id: ExerciseTypeCategory; label: string; desc: string }[] = [
  { id: "combination", label: "Combinações de golpes", desc: "Sequências ordenadas de técnicas (estilo Manoplas e Clinche)" },
  { id: "rounds", label: "Rounds e tempo", desc: "Rounds e duração em minutos (estilo Saco pesado, Sombra, Cardio)" },
  { id: "reps", label: "Séries e repetições", desc: "Séries (sets) e repetições (estilo Burpees, flexões)" },
  { id: "sparring", label: "Sparring e intensidade", desc: "Rounds, duração, intensidade definida e regras/condições" },
]

export function ExerciseTypeDialog({ definition, onClose, onSave }: ExerciseTypeDialogProps) {
  const isEditing = Boolean(definition)
  const [name, setName] = useState(definition?.name ?? "")
  const [description, setDescription] = useState(definition?.description ?? "")
  const [category, setCategory] = useState<ExerciseTypeCategory>(definition?.category ?? "rounds")
  const [defaultName, setDefaultName] = useState(definition?.defaultName ?? "")
  const [rounds, setRounds] = useState(definition?.defaultRounds ?? 3)
  const [duration, setDuration] = useState(definition?.defaultDuration ?? 3)
  const [sets, setSets] = useState(definition?.defaultSets ?? 3)
  const [reps, setReps] = useState(definition?.defaultReps ?? 10)
  const [error, setError] = useState("")

  function handleSave() {
    const trimmedName = name.trim()
    const trimmedDesc = description.trim()
    if (!trimmedName) {
      setError("Informe o nome do tipo de exercício.")
      return
    }
    if (!trimmedDesc) {
      setError("Informe uma descrição para este exercício.")
      return
    }

    const generatedId = trimmedName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || `custom-${Date.now()}`
    const id = definition?.id ?? generatedId

    onSave({
      id,
      name: trimmedName,
      description: trimmedDesc,
      category,
      defaultName: defaultName.trim() || trimmedName,
      defaultRounds: category === "reps" ? undefined : rounds,
      defaultDuration: category === "reps" ? undefined : duration,
      defaultSets: category === "reps" ? sets : undefined,
      defaultReps: category === "reps" ? reps : undefined,
      defaultIntensity: category === "sparring" ? "light" : undefined,
      isCustom: definition ? definition.isCustom : true,
    })
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <section className="modal type-editor-modal" role="dialog" aria-modal="true" aria-labelledby="type-modal-title">
        <div className="modal-head">
          <div>
            <div className="section-kicker">{isEditing ? "CONFIGURAÇÃO DO TIPO" : "NOVO TIPO DE EXERCÍCIO"}</div>
            <h2 id="type-modal-title">{isEditing ? `Editar: ${definition?.name}` : "Criar tipo de exercício"}</h2>
          </div>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <div className="modal-fields">
          <label>
            NOME DO TIPO
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Cardio, Clinche, Defesa de quedas..."
              autoFocus
            />
          </label>

          <label>
            FORMATO DO EXERCÍCIO
            <select
              value={category}
              disabled={isEditing}
              onChange={(e) => setCategory(e.target.value as ExerciseTypeCategory)}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            DESCRIÇÃO DO TIPO
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explique o objetivo ou foco desse exercício..."
              rows={3}
            />
          </label>

          <label>
            NOME PADRÃO AO ADICIONAR NO TREINO
            <input
              value={defaultName}
              onChange={(e) => setDefaultName(e.target.value)}
              placeholder="Ex.: Cardio — corda e corrida"
            />
          </label>

          {category === "reps" ? (
            <>
              <label>
                SÉRIES PADRÃO
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={sets}
                  onChange={(e) => setSets(Math.max(1, Number(e.target.value) || 1))}
                />
              </label>
              <label>
                REPETIÇÕES PADRÃO
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={reps}
                  onChange={(e) => setReps(Math.max(1, Number(e.target.value) || 1))}
                />
              </label>
            </>
          ) : (
            <>
              <label>
                ROUNDS PADRÃO
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={rounds}
                  onChange={(e) => setRounds(Math.max(1, Number(e.target.value) || 1))}
                />
              </label>
              <label>
                DURAÇÃO DO ROUND (MINUTOS)
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={duration}
                  onChange={(e) => setDuration(Math.max(1, Number(e.target.value) || 1))}
                />
              </label>
            </>
          )}
        </div>

        {error && <p className="field-error">{error}</p>}

        <div className="modal-actions">
          <button className="cancel-btn" type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="top-create" type="button" onClick={handleSave}>
            <Plus size={15} /> {isEditing ? "Salvar alterações" : "Adicionar tipo"}
          </button>
        </div>
      </section>
    </div>
  )
}
