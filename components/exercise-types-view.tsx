"use client"

import { Pencil, Plus, RotateCcw, Trash2 } from "lucide-react"
import { useState } from "react"

import { ExerciseIcon } from "@/components/exercise-icon"
import { ExerciseTypeDialog } from "@/components/exercise-type-dialog"
import { loadExerciseTypes, resetExerciseTypes, saveExerciseTypes } from "@/lib/exercise-types"
import type { ExerciseTypeDefinition } from "@/lib/types"

type ExerciseTypesViewProps = {
  onTypesChange?: (types: ExerciseTypeDefinition[]) => void
}

const categoryLabels: Record<string, string> = {
  combination: "Combinações de golpes",
  rounds: "Rounds & Duração",
  reps: "Séries & Repetições",
  sparring: "Combate & Sparring",
}

export function ExerciseTypesView({ onTypesChange }: ExerciseTypesViewProps) {
  const [types, setTypes] = useState<ExerciseTypeDefinition[]>(() => loadExerciseTypes())
  const [editingType, setEditingType] = useState<ExerciseTypeDefinition | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  function updateList(next: ExerciseTypeDefinition[]) {
    setTypes(next)
    saveExerciseTypes(next)
    onTypesChange?.(next)
  }

  function handleSave(saved: ExerciseTypeDefinition) {
    const exists = types.some((t) => t.id === saved.id)
    const next = exists ? types.map((t) => (t.id === saved.id ? saved : t)) : [...types, saved]
    updateList(next)
    setEditingType(null)
    setIsCreating(false)
  }

  function handleDelete(id: string) {
    const next = types.filter((t) => t.id !== id)
    updateList(next)
  }

  function handleReset() {
    if (confirm("Restaurar os tipos de exercício padrão? Suas alterações serão substituídas.")) {
      const defaults = resetExerciseTypes()
      setTypes(defaults)
      onTypesChange?.(defaults)
    }
  }

  return (
    <section className="content types-content">
      <div className="welcome-row">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" /> BIBLIOTECA DE TREINO
          </div>
          <h1>Tipos de Exercício</h1>
          <p className="welcome-sub">
            Personalize nomes, descrições e configurações padrão para montar seus treinos round a round.
          </p>
        </div>
        <div className="types-top-actions">
          <button className="cancel-btn" type="button" onClick={handleReset} title="Restaurar definições originais">
            <RotateCcw size={14} /> Restaurar padrões
          </button>
          <button className="top-create" type="button" onClick={() => setIsCreating(true)}>
            <Plus size={16} /> Novo tipo
          </button>
        </div>
      </div>

      <div className="types-grid">
        {types.map((type) => (
          <article key={type.id} className="type-card">
            <div className="type-card-head">
              <div className="exercise-type-icon">
                <ExerciseIcon type={type.id} size={16} />
              </div>
              <div className="type-card-title-group">
                <h3>{type.name}</h3>
                <span className="type-cat-tag">{categoryLabels[type.category] ?? type.category}</span>
              </div>
              <div className="type-card-actions">
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Editar ${type.name}`}
                  onClick={() => setEditingType(type)}
                >
                  <Pencil size={14} />
                </button>
                {type.isCustom && (
                  <button
                    type="button"
                    className="icon-btn delete-btn"
                    aria-label={`Excluir ${type.name}`}
                    onClick={() => handleDelete(type.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            <p className="type-card-desc">{type.description}</p>

            <div className="type-card-footer">
              <span className="type-default-preview">
                {type.category === "reps"
                  ? `Padrão: ${type.defaultSets ?? 3} séries × ${type.defaultReps ?? 10} reps`
                  : type.category === "sparring"
                    ? `Padrão: ${type.defaultRounds ?? 3} rds · ${type.defaultDuration ?? 3} min · Leve`
                    : `Padrão: ${type.defaultRounds ?? 3} rds · ${type.defaultDuration ?? 3} min`}
              </span>
              <button
                type="button"
                className="edit-type-link"
                onClick={() => setEditingType(type)}
              >
                Editar descrição &gt;
              </button>
            </div>
          </article>
        ))}
      </div>

      {isCreating && (
        <ExerciseTypeDialog
          onClose={() => setIsCreating(false)}
          onSave={handleSave}
        />
      )}

      {editingType && (
        <ExerciseTypeDialog
          definition={editingType}
          onClose={() => setEditingType(null)}
          onSave={handleSave}
        />
      )}
    </section>
  )
}
