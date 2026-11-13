import { ChevronDown, ChevronUp, Plus, Trash2, X } from "lucide-react"
import { useEffect, useState } from "react"

import { ExerciseIcon } from "@/components/exercise-icon"
import { PadWorkEditor } from "@/components/pad-work-editor"
import { exerciseTypeLabels, intensityLabels } from "@/lib/format"
import { clampCount, createExercise, createId, moveItem } from "@/lib/sessions"
import type { Discipline, Exercise, PadWorkExercise, Session, SparringExercise } from "@/lib/types"
import { disciplines, exerciseTypes, sparringIntensities } from "@/lib/types"

type SessionEditorProps = {
  session?: Session
  date: string
  onClose: () => void
  onSave: (session: Session) => void
}

type Draft = {
  id: string
  date: string
  title: string
  kind: Discipline
  notes: string
  exercises: Exercise[]
}

function toDraft(session: Session | undefined, date: string): Draft {
  if (!session) {
    return { id: createId(), date, title: "", kind: "TREINO", notes: "", exercises: [] }
  }
  return {
    id: session.id,
    date: session.date,
    title: session.title,
    kind: session.kind,
    notes: session.notes ?? "",
    exercises: structuredClone(session.exercises),
  }
}

function cleanExercise(exercise: Exercise): Exercise {
  const name = exercise.name.trim()
  const notes = exercise.notes?.trim()
  const next = { ...exercise, name, notes: notes ? notes : undefined }
  if (next.type === "pad-work") {
    return { ...next, combinations: next.combinations.filter((combination) => combination.techniques.length > 0) }
  }
  return next
}

export function SessionEditor({ session, date, onClose, onSave }: SessionEditorProps) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(session, date))
  const [error, setError] = useState("")
  const editing = Boolean(session)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  function updateExercise(id: string, recipe: (exercise: Exercise) => Exercise) {
    setDraft((current) => ({
      ...current,
      exercises: current.exercises.map((exercise) => (exercise.id === id ? recipe(exercise) : exercise)),
    }))
  }

  function save() {
    const title = draft.title.trim()
    if (!title) {
      setError("Dê um nome ao treino.")
      return
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.date)) {
      setError("Escolha uma data.")
      return
    }
    if (draft.exercises.some((exercise) => !exercise.name.trim())) {
      setError("Dê um nome a cada exercício.")
      return
    }
    if (
      draft.exercises.some(
        (exercise) => exercise.type === "pad-work" && exercise.combinations.some((combination) => combination.techniques.length === 0),
      )
    ) {
      setError("Toda combinação precisa de pelo menos um golpe.")
      return
    }
    const notes = draft.notes.trim()
    onSave({
      id: draft.id,
      date: draft.date,
      title,
      kind: draft.kind,
      notes: notes || undefined,
      exercises: draft.exercises.map(cleanExercise),
    })
  }

  return (
    <div className="modal-backdrop">
      <section className="modal create-modal" role="dialog" aria-modal="true" aria-labelledby="editor-title">
        <div className="modal-head">
          <div>
            <div className="section-kicker">{editing ? "EDITAR REGISTRO" : "NOVO REGISTRO"}</div>
            <h2 id="editor-title">{editing ? "Editar treino" : "Montar um treino"}</h2>
          </div>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>
        <div className="modal-fields">
          <label>
            TÍTULO DO TREINO
            <input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Ex.: Terça de Muay Thai" autoFocus />
          </label>
          <label>
            DATA
            <input type="date" value={draft.date} onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))} />
          </label>
          <label>
            MODALIDADE
            <select value={draft.kind} onChange={(event) => setDraft((current) => ({ ...current, kind: event.target.value as Discipline }))}>
              {disciplines.map((kind) => (
                <option key={kind} value={kind}>
                  {kind}
                </option>
              ))}
            </select>
          </label>
          <label>
            NOTAS DO TREINO
            <textarea value={draft.notes} onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))} placeholder="Foco, observações ou lembretes..." rows={2} />
          </label>
        </div>
        <div className="exercise-builder">
          <div className="builder-title">
            <span>
              EXERCÍCIOS <i>{draft.exercises.length}</i>
            </span>
            <span>SEQUÊNCIA DE TREINO</span>
          </div>
          <div className="builder-subtitle">
            <span>Monte seu circuito, round a round.</span>
            <span>{draft.exercises.length ? `${String(draft.exercises.length).padStart(2, "0")} ESTAÇÕES` : "TOQUE PARA ADICIONAR"}</span>
          </div>
          <div className="exercise-type-grid">
            {exerciseTypes.map((type) => (
              <button key={type} type="button" onClick={() => setDraft((current) => ({ ...current, exercises: [...current.exercises, createExercise(type)] }))}>
                <ExerciseIcon type={type} size={16} />
                {exerciseTypeLabels[type]}
                <Plus size={13} />
              </button>
            ))}
          </div>
          {draft.exercises.map((exercise, index) => (
            <div className="draft-exercise" key={exercise.id}>
              <div className="draft-title">
                <span className="draft-round-index">{String(index + 1).padStart(2, "0")}</span>
                <div className="exercise-type-icon">
                  <ExerciseIcon type={exercise.type} />
                </div>
                <div className="draft-name-group">
                  <b>{exercise.name || "Sem nome"}</b>
                  <span>
                    {exerciseTypeLabels[exercise.type].toUpperCase()} · ESTAÇÃO {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <span className="draft-round-chip">ROUND {String(index + 1).padStart(2, "0")}</span>
                <div className="draft-move">
                  <button type="button" aria-label="Mover exercício para cima" disabled={index === 0} onClick={() => setDraft((current) => ({ ...current, exercises: moveItem(current.exercises, index, -1) }))}>
                    <ChevronUp size={14} />
                  </button>
                  <button type="button" aria-label="Mover exercício para baixo" disabled={index === draft.exercises.length - 1} onClick={() => setDraft((current) => ({ ...current, exercises: moveItem(current.exercises, index, 1) }))}>
                    <ChevronDown size={14} />
                  </button>
                </div>
                <button type="button" aria-label="Remover exercício" onClick={() => setDraft((current) => ({ ...current, exercises: current.exercises.filter((item) => item.id !== exercise.id) }))}>
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="draft-fields">
                <label className="draft-span">
                  NOME
                  <input value={exercise.name} onChange={(event) => updateExercise(exercise.id, (item) => ({ ...item, name: event.target.value }))} />
                </label>
                {exercise.type === "burpees" ? (
                  <>
                    <label>
                      SÉRIES
                      <input type="number" min={1} max={99} value={exercise.sets} onChange={(event) => updateExercise(exercise.id, (item) => (item.type === "burpees" ? { ...item, sets: clampCount(event.target.value) } : item))} />
                    </label>
                    <label>
                      REPETIÇÕES
                      <input type="number" min={1} max={999} value={exercise.reps} onChange={(event) => updateExercise(exercise.id, (item) => (item.type === "burpees" ? { ...item, reps: clampCount(event.target.value, 999) } : item))} />
                    </label>
                  </>
                ) : (
                  <>
                    <label>
                      ROUNDS
                      <input type="number" min={1} max={99} value={exercise.rounds} onChange={(event) => updateExercise(exercise.id, (item) => (item.type === "burpees" ? item : { ...item, rounds: clampCount(event.target.value) }))} />
                    </label>
                    <label>
                      MINUTOS
                      <input type="number" min={1} max={99} value={exercise.durationMinutes} onChange={(event) => updateExercise(exercise.id, (item) => (item.type === "burpees" ? item : { ...item, durationMinutes: clampCount(event.target.value) }))} />
                    </label>
                  </>
                )}
                {exercise.type === "sparring" && (
                  <label className="draft-span">
                    INTENSIDADE
                    <select
                      value={exercise.intensity}
                      onChange={(event) =>
                        updateExercise(exercise.id, (item) =>
                          item.type === "sparring" ? { ...item, intensity: event.target.value as SparringExercise["intensity"] } : item,
                        )
                      }
                    >
                      {sparringIntensities.map((intensity) => (
                        <option key={intensity} value={intensity}>
                          {intensityLabels[intensity]}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {exercise.type === "pad-work" && (
                  <div className="draft-span">
                    <PadWorkEditor exercise={exercise} onChange={(next: PadWorkExercise) => updateExercise(exercise.id, () => next)} />
                  </div>
                )}
                <label className="draft-span">
                  {exercise.type === "sparring" ? "REGRAS E CONDIÇÕES" : "NOTAS"}
                  <input
                    value={exercise.notes ?? ""}
                    placeholder={exercise.type === "sparring" ? "Ex.: só boxe, sem chutes na cabeça" : "Opcional"}
                    onChange={(event) => updateExercise(exercise.id, (item) => ({ ...item, notes: event.target.value }))}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
        {error && <p className="field-error">{error}</p>}
        <div className="modal-actions">
          <button className="cancel-btn" type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="top-create" type="button" disabled={!draft.title.trim()} onClick={save}>
            <Plus size={15} /> {editing ? "Salvar alterações" : "Criar treino"}
          </button>
        </div>
      </section>
    </div>
  )
}
