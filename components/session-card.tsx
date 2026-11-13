import { Activity, CalendarDays, Check, CheckCircle2, Clock3, Pencil, Share2, Trash2 } from "lucide-react"

import { ExerciseIcon } from "@/components/exercise-icon"
import { formatShortDate } from "@/lib/dates"
import { formatCombo, formatDetail } from "@/lib/format"
import { getStatus } from "@/lib/sessions"
import type { Session } from "@/lib/types"

type SessionCardProps = {
  session: Session
  onToggle: (sessionId: string, exerciseId: string) => void
  onShare: (session: Session) => void
  onEdit: (session: Session) => void
  onDelete: (session: Session) => void
}

export function SessionCard({ session, onToggle, onShare, onEdit, onDelete }: SessionCardProps) {
  const done = session.exercises.filter((exercise) => exercise.done).length
  const total = session.exercises.length
  const status = getStatus(session)

  return (
    <article className="session-card">
      <div className={`session-accent ${status}`} />
      <div className="session-main">
        <div className="session-meta">
          <span className={`status-pill ${status}`}>
            {status === "complete" ? <CheckCircle2 size={12} /> : status === "partial" ? <Activity size={12} /> : <Clock3 size={12} />}
            {status === "complete" ? "CONCLUÍDO" : status === "partial" ? `${done}/${total} FEITOS` : "PLANEJADO"}
          </span>
          <span className="session-kind">{session.kind}</span>
        </div>
        <h3>{session.title}</h3>
        <span className="session-date">
          <CalendarDays size={13} />
          {formatShortDate(session.date)}
          <span>·</span>
          {total} {total === 1 ? "exercício" : "exercícios"}
        </span>
        <div className="exercise-checklist">
          {session.exercises.length === 0 ? (
            <p className="session-empty-ex">Nenhum exercício ainda. Toque no ícone de lápis para adicionar.</p>
          ) : (
            session.exercises.map((exercise) => (
              <button
                key={exercise.id}
                type="button"
                onClick={() => onToggle(session.id, exercise.id)}
                className={`exercise-row ${exercise.done ? "done" : ""}`}
                aria-label={`${exercise.done ? "Desmarcar" : "Concluir"} ${exercise.name}`}
              >
                <span className={`check-square ${exercise.done ? "checked" : ""}`}>{exercise.done && <Check size={12} />}</span>
                <ExerciseIcon type={exercise.type} size={14} />
                <span className="exercise-name">{exercise.name}</span>
                <span className="exercise-detail">{formatDetail(exercise)}</span>
                {exercise.type === "pad-work" && exercise.combinations.length > 0 && (
                  <div className="exercise-combos">
                    {exercise.combinations.map((c, i) => (
                      <span key={c.id} className="combo-chip-item">
                        <span className="combo-chip-label">C{i + 1}</span>
                        <span className="combo-chip-flow">{formatCombo(c)}</span>
                      </span>
                    ))}
                  </div>
                )}
                {exercise.notes && (
                  <span className="exercise-notes-line">
                    <span className="notes-prefix">{exercise.type === "sparring" ? "REGRAS" : "OBS"}:</span>
                    {exercise.notes}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
        {session.notes && <div className="session-notes">{session.notes}</div>}
      </div>
      <div className="session-actions">
        <button type="button" className="session-share icon-only" aria-label={`Editar ${session.title}`} onClick={() => onEdit(session)}>
          <Pencil size={14} />
        </button>
        <button type="button" className="session-share icon-only" aria-label={`Excluir ${session.title}`} onClick={() => onDelete(session)}>
          <Trash2 size={14} />
        </button>
        <button type="button" className="session-share" onClick={() => onShare(session)}>
          <Share2 size={14} />
          <span>Compartilhar</span>
        </button>
      </div>
    </article>
  )
}
