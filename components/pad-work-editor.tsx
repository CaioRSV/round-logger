import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react"
import { useState } from "react"

import { customTechnique, presetTechnique, techniqueGroups } from "@/lib/techniques"
import { createId, moveItem } from "@/lib/sessions"
import type { Combination, PadWorkExercise, Technique } from "@/lib/types"

type PadWorkEditorProps = {
  exercise: PadWorkExercise
  onChange: (exercise: PadWorkExercise) => void
}

export function PadWorkEditor({ exercise, onChange }: PadWorkEditorProps) {
  const [custom, setCustom] = useState<Record<string, string>>({})

  function updateCombinations(combinations: Combination[]) {
    onChange({ ...exercise, combinations })
  }

  function updateCombination(id: string, combination: Combination) {
    updateCombinations(exercise.combinations.map((item) => (item.id === id ? combination : item)))
  }

  function addTechnique(combination: Combination, technique: Technique) {
    updateCombination(combination.id, { ...combination, techniques: [...combination.techniques, technique] })
  }

  return (
    <div className="combo-board">
      <div className="builder-title">
        <span>
          COMBINAÇÕES <i>{exercise.combinations.length}</i>
        </span>
        <span>SEQUÊNCIA DE GOLPES</span>
      </div>
      {exercise.combinations.length === 0 && (
        <div className="combo-card empty-combo-card">
          <p className="combo-empty">Nenhuma combinação ainda. Toque em &quot;Nova combinação&quot; para definir a sequência de golpes.</p>
        </div>
      )}
      {exercise.combinations.map((combination, index) => {
        const customValue = custom[combination.id] ?? ""
        return (
          <section key={combination.id} className={`combo-card ${combination.techniques.length === 0 ? "invalid" : ""}`}>
            <div className="combo-toolbar">
              <b>COMBO {String(index + 1).padStart(2, "0")}</b>
              <div className="draft-move">
                <button
                  type="button"
                  aria-label="Mover combinação para cima"
                  disabled={index === 0}
                  onClick={() => updateCombinations(moveItem(exercise.combinations, index, -1))}
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  aria-label="Mover combinação para baixo"
                  disabled={index === exercise.combinations.length - 1}
                  onClick={() => updateCombinations(moveItem(exercise.combinations, index, 1))}
                >
                  <ChevronDown size={14} />
                </button>
              </div>
              <button
                type="button"
                className="mini-btn"
                aria-label="Remover combinação"
                onClick={() => updateCombinations(exercise.combinations.filter((item) => item.id !== combination.id))}
              >
                <Trash2 size={13} />
              </button>
            </div>
            {combination.techniques.length === 0 && <p className="combo-empty">Adicione pelo menos um golpe.</p>}
            <ol className="tech-list">
              {combination.techniques.map((technique, techniqueIndex) => (
                <li key={technique.id} className="tech-row">
                  <span className="tech-index">{String(techniqueIndex + 1).padStart(2, "0")}</span>
                  <span className="tech-label">
                    {technique.label}
                    {technique.custom && <em> personalizado</em>}
                  </span>
                  <div className="draft-move">
                    <button
                      type="button"
                      aria-label="Mover golpe para cima"
                      disabled={techniqueIndex === 0}
                      onClick={() =>
                        updateCombination(combination.id, {
                          ...combination,
                          techniques: moveItem(combination.techniques, techniqueIndex, -1),
                        })
                      }
                    >
                      <ChevronUp size={13} />
                    </button>
                    <button
                      type="button"
                      aria-label="Mover golpe para baixo"
                      disabled={techniqueIndex === combination.techniques.length - 1}
                      onClick={() =>
                        updateCombination(combination.id, {
                          ...combination,
                          techniques: moveItem(combination.techniques, techniqueIndex, 1),
                        })
                      }
                    >
                      <ChevronDown size={13} />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="mini-btn"
                    aria-label={`Remover ${technique.label}`}
                    onClick={() =>
                      updateCombination(combination.id, {
                        ...combination,
                        techniques: combination.techniques.filter((item) => item.id !== technique.id),
                      })
                    }
                  >
                    <Trash2 size={12} />
                  </button>
                </li>
              ))}
            </ol>
            <div className="combo-add-row">
              <select
                value=""
                aria-label={`Adicionar golpe à combinação ${index + 1}`}
                onChange={(event) => {
                  const presetId = event.target.value
                  if (!presetId) return
                  addTechnique(combination, presetTechnique(presetId))
                }}
              >
                <option value="">Adicionar golpe</option>
                {techniqueGroups.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.techniques.map((technique) => (
                      <option key={technique.id} value={technique.id}>
                        {technique.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div className="combo-add-row">
              <input
                value={customValue}
                placeholder="Golpe personalizado"
                aria-label={`Golpe personalizado na combinação ${index + 1}`}
                onChange={(event) => setCustom((current) => ({ ...current, [combination.id]: event.target.value }))}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return
                  event.preventDefault()
                  const label = customValue.trim()
                  if (!label) return
                  addTechnique(combination, customTechnique(label))
                  setCustom((current) => ({ ...current, [combination.id]: "" }))
                }}
              />
              <button
                type="button"
                className="mini-text"
                disabled={!customValue.trim()}
                onClick={() => {
                  addTechnique(combination, customTechnique(customValue))
                  setCustom((current) => ({ ...current, [combination.id]: "" }))
                }}
              >
                Criar
              </button>
            </div>
          </section>
        )
      })}
      <button
        type="button"
        className="add-link"
        onClick={() =>
          updateCombinations([
            ...exercise.combinations,
            { id: createId(), techniques: [presetTechnique("jab"), presetTechnique("cross")] },
          ])
        }
      >
        <Plus size={13} /> Nova combinação
      </button>
    </div>
  )
}
