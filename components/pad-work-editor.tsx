import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react"
import { useState } from "react"

import {
  combinationPresetTechniques,
  describeCombinationPreset,
  findCombinationPreset,
  getCombinationPresetGroupsForType,
  type CombinationPresetGroup,
} from "@/lib/combination-presets"
import { customTechnique, getTechniqueGroupsForType, presetTechnique } from "@/lib/techniques"
import { createId, moveItem } from "@/lib/sessions"
import type { Combination, CombinationExercise, Technique } from "@/lib/types"

function CombinationPresetOptions({ groups }: { groups: CombinationPresetGroup[] }) {
  return groups.map((group) => (
    <optgroup key={group.label} label={group.label}>
      {group.presets.map((preset) => (
        <option key={preset.id} value={preset.id}>
          {describeCombinationPreset(preset)}
        </option>
      ))}
    </optgroup>
  ))
}

type PadWorkEditorProps = {
  exercise: CombinationExercise
  onChange: (exercise: CombinationExercise) => void
}

export function PadWorkEditor({ exercise, onChange }: PadWorkEditorProps) {
  const [custom, setCustom] = useState<Record<string, string>>({})
  const [editing, setEditing] = useState<{ techniqueId: string; value: string } | null>(null)
  const isClinch = exercise.type === "clinch"
  const availableGroups = getTechniqueGroupsForType(exercise.type)
  const presetGroups = getCombinationPresetGroupsForType(exercise.type)

  function updateCombinations(combinations: Combination[]) {
    onChange({ ...exercise, combinations } as CombinationExercise)
  }

  function updateCombination(id: string, combination: Combination) {
    updateCombinations(exercise.combinations.map((item) => (item.id === id ? combination : item)))
  }

  function commitRename(combination: Combination, technique: Technique) {
    if (!editing) return
    const label = editing.value.trim()
    setEditing(null)
    if (!label || label === technique.label) return
    updateCombination(combination.id, {
      ...combination,
      techniques: combination.techniques.map((item) => (item.id === technique.id ? { ...item, label, custom: true } : item)),
    })
  }

  function addTechniques(combination: Combination, techniques: Technique[]) {
    updateCombination(combination.id, { ...combination, techniques: [...combination.techniques, ...techniques] })
  }

  function addTechnique(combination: Combination, technique: Technique) {
    addTechniques(combination, [technique])
  }

  function addCombinationFromPreset(presetId: string) {
    const preset = findCombinationPreset(presetId)
    if (!preset) return
    updateCombinations([...exercise.combinations, { id: createId(), techniques: combinationPresetTechniques(preset) }])
  }

  function defaultNewCombo(): Combination {
    return isClinch
      ? {
          id: createId(),
          techniques: [presetTechnique("clinch-plum"), presetTechnique("clinch-joelhada-reta")],
        }
      : {
          id: createId(),
          techniques: [presetTechnique("jab"), presetTechnique("direto")],
        }
  }

  return (
    <div className="combo-board">
      <div className="builder-title">
        <span>
          COMBINAÇÕES <i>{exercise.combinations.length}</i>
        </span>
        <span>{isClinch ? "SEQUÊNCIA NO CORPO A CORPO" : "SEQUÊNCIA DE GOLPES"}</span>
      </div>
      {exercise.combinations.length === 0 && (
        <div className="combo-card empty-combo-card">
          <p className="combo-empty">
            {isClinch
              ? "Nenhuma sequência de clinche ainda. Toque em 'Nova combinação' para montar a pegada e os golpes."
              : "Nenhuma combinação ainda. Toque em 'Nova combinação' ou escolha uma combinação pronta abaixo."}
          </p>
        </div>
      )}
      {exercise.combinations.map((combination, index) => {
        const customValue = custom[combination.id] ?? ""
        return (
          <section key={combination.id} className={`combo-card ${combination.techniques.length === 0 ? "invalid" : ""}`}>
            <div className="combo-toolbar">
              <b>{isClinch ? `COMBO CLINCHE ${String(index + 1).padStart(2, "0")}` : `COMBO ${String(index + 1).padStart(2, "0")}`}</b>
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
            {combination.techniques.length === 0 && <p className="combo-empty">Adicione pelo menos um golpe ou pegada.</p>}
            <ol className="tech-list">
              {combination.techniques.map((technique, techniqueIndex) => (
                <li key={technique.id} className="tech-row">
                  <span className="tech-index">{String(techniqueIndex + 1).padStart(2, "0")}</span>
                  {editing?.techniqueId === technique.id ? (
                    <input
                      className="tech-label-input"
                      autoFocus
                      value={editing.value}
                      aria-label={`Renomear ${technique.label}`}
                      onFocus={(event) => event.target.select()}
                      onChange={(event) => setEditing({ ...editing, value: event.target.value })}
                      onBlur={() => commitRename(combination, technique)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault()
                          commitRename(combination, technique)
                        } else if (event.key === "Escape") {
                          // Evita que o Esc feche o modal inteiro.
                          event.preventDefault()
                          event.stopPropagation()
                          event.nativeEvent.stopImmediatePropagation()
                          setEditing(null)
                        }
                      }}
                    />
                  ) : (
                    <span
                      className="tech-label editable"
                      title="Clique duas vezes para renomear"
                      onDoubleClick={() => setEditing({ techniqueId: technique.id, value: technique.label })}
                    >
                      {technique.label}
                      {technique.custom && <em> personalizado</em>}
                    </span>
                  )}
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
                aria-label={`Adicionar técnica à combinação ${index + 1}`}
                onChange={(event) => {
                  const presetId = event.target.value
                  if (!presetId) return
                  addTechnique(combination, presetTechnique(presetId))
                }}
              >
                <option value="">{isClinch ? "Adicionar golpe / pegada" : "Adicionar golpe"}</option>
                {availableGroups.map((group) => (
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
              <select
                value=""
                aria-label={`Importar combinação pronta para a combinação ${index + 1}`}
                onChange={(event) => {
                  const preset = findCombinationPreset(event.target.value)
                  if (!preset) return
                  addTechniques(combination, combinationPresetTechniques(preset))
                }}
              >
                <option value="">Adicionar combinação pronta (vários golpes)</option>
                <CombinationPresetOptions groups={presetGroups} />
              </select>
            </div>
            <div className="combo-add-row">
              <input
                value={customValue}
                placeholder={isClinch ? "Golpe ou pegada personalizada (ex.: Joelhada no fígado)" : "Golpe personalizado (ex.: Overhand)"}
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
        onClick={() => updateCombinations([...exercise.combinations, defaultNewCombo()])}
      >
        <Plus size={13} /> {isClinch ? "Nova combinação de clinche" : "Nova combinação"}
      </button>
      <div className="combo-add-row">
        <select
          value=""
          aria-label="Nova combinação a partir de uma combinação pronta"
          onChange={(event) => addCombinationFromPreset(event.target.value)}
        >
          <option value="">Nova combinação a partir de uma pronta…</option>
          <CombinationPresetOptions groups={presetGroups} />
        </select>
      </div>
    </div>
  )
}
