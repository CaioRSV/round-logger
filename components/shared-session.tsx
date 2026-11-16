"use client"

import { CalendarDays, CalendarPlus, Check, Clock3, Shield, Swords } from "lucide-react"
import { useEffect, useState } from "react"

import { ExerciseIcon } from "@/components/exercise-icon"
import { dateKey, formatLongDate } from "@/lib/dates"
import { exerciseTypeLabels, formatCombo, formatVolume, intensityLabels } from "@/lib/format"
import { copySessionToCalendar, decodeSharePayload, findStoredSession } from "@/lib/storage"
import type { Session } from "@/lib/types"
import { hasCombinations } from "@/lib/types"

function readHashPayload(): Session | null {
  if (typeof window === "undefined") return null
  const hash = window.location.hash.replace(/^#/, "")
  if (!hash) return null
  let payload = hash
  try {
    payload = decodeURIComponent(hash)
  } catch {
    payload = hash
  }
  return decodeSharePayload(payload)
}

export function SharedSessionView({ id }: { id: string }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [targetDate, setTargetDate] = useState(() => dateKey(new Date()))
  const [savedSessionId, setSavedSessionId] = useState<string | null>(null)
  const [copiedDate, setCopiedDate] = useState<string | null>(null)

  useEffect(() => {
    const loaded = readHashPayload() ?? findStoredSession(id)
    setSession(loaded)
    if (loaded?.date) {
      // Default target date to today, or if user prefers, they can pick any date
      setTargetDate(dateKey(new Date()))
    }
  }, [id])

  function handleImportToCalendar() {
    if (!session) return
    const cloned = copySessionToCalendar(session, targetDate)
    setSavedSessionId(cloned.id)
    setCopiedDate(targetDate)
  }

  return (
    <main className="shared-page">
      <header className="shared-header">
        <a className="brand" href="/">
          <span className="brand-mark">
            <Swords size={19} />
          </span>
          <span>
            round<span className="brand-light">logger</span>
          </span>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="shared-label">
            <Shield size={13} /> PLANO COMPARTILHADO
          </span>
          <a href="/" className="cancel-btn" style={{ textDecoration: "none", padding: "6px 12px", fontSize: "11px" }}>
            Meu painel
          </a>
        </div>
      </header>

      {session === undefined ? (
        <article className="shared-card">
          <div className="shared-eyebrow">CARREGANDO</div>
          <h1>Abrindo o plano…</h1>
        </article>
      ) : session === null ? (
        <article className="shared-card">
          <div className="shared-eyebrow">
            LINK <span>·</span> SEM PLANO
          </div>
          <h1>Esse treino não está neste navegador.</h1>
          <p className="shared-missing">
            O link completo traz o plano nele mesmo através do endereço copiado. Se você abriu só o endereço curto, o treino precisa ter sido salvo localmente neste aparelho.
          </p>
          <footer className="shared-footer">
            <Shield size={14} /> Visualização somente leitura.
            <a href="/">
              Criar seu próprio registro <span>↗</span>
            </a>
          </footer>
        </article>
      ) : (
        <article className="shared-card">
          <div className="shared-eyebrow">
            {session.kind}
            <span>·</span> SESSÃO DE TREINO
          </div>
          <h1>{session.title}</h1>
          <div className="shared-date">
            <CalendarDays size={15} />
            {formatLongDate(session.date)}
          </div>

          {/* Action box to pull workout to own calendar */}
          <section className="shared-pull-box" aria-label="Copiar treino para o meu calendário">
            <div className="shared-pull-header">
              <div className="shared-pull-emblem">
                <CalendarPlus size={18} />
              </div>
              <div className="shared-pull-copy">
                <b>Puxar treino para o meu calendário</b>
                <span>
                  Copie este treino para o seu espaço pessoal para executá-lo, agendar a data e marcar os exercícios concluídos.
                </span>
              </div>
            </div>

            {savedSessionId ? (
              <div className="shared-pull-success">
                <div className="shared-pull-success-badge">
                  <Check size={16} />
                  <span>
                    Treino copiado com sucesso para o dia <b>{copiedDate}</b>!
                  </span>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                  <a href="/" className="top-create" style={{ textDecoration: "none", height: "32px", fontSize: "11px" }}>
                    Abrir meu calendário ↗
                  </a>
                  <button
                    type="button"
                    className="cancel-btn"
                    style={{ height: "32px", fontSize: "11px", padding: "0 10px" }}
                    onClick={() => {
                      setSavedSessionId(null)
                      setCopiedDate(null)
                    }}
                  >
                    Copiar para outra data
                  </button>
                </div>
              </div>
            ) : (
              <div className="shared-pull-form">
                <div className="shared-pull-input-wrap">
                  <label htmlFor="target-date">Agendar para:</label>
                  <input
                    id="target-date"
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="shared-date-input"
                  />
                </div>
                <button type="button" className="top-create" onClick={handleImportToCalendar}>
                  <CalendarPlus size={15} /> Puxar para meu calendário
                </button>
              </div>
            )}
          </section>

          <div className="shared-plan-banner">
            <div className="shared-plan-emblem">
              <Swords size={18} />
            </div>
            <div>
              <span>O PLANO DO DIA</span>
              <b>Seu próximo round começa aqui.</b>
            </div>
            <strong>
              {String(session.exercises.length).padStart(2, "0")}
              <small> ESTAÇÕES</small>
            </strong>
          </div>

          {session.notes && (
            <div className="shared-notes">
              <span>NOTAS DO TREINO</span>
              <p>{session.notes}</p>
            </div>
          )}

          <div className="shared-exercises-title">
            <span>SEQUÊNCIA DO TREINO</span>
            <span>{session.exercises.length} ESTAÇÕES</span>
          </div>

          <div className="shared-exercises">
            {session.exercises.map((exercise, index) => (
              <section className="shared-exercise" key={exercise.id}>
                <div className="shared-station-index">{String(index + 1).padStart(2, "0")}</div>
                <div className="exercise-type-icon">
                  <ExerciseIcon type={exercise.type} size={16} />
                </div>
                <div className="shared-exercise-copy">
                  <div className="shared-exercise-heading">
                    <span>{(exerciseTypeLabels[exercise.type] ?? exercise.name).toUpperCase()}</span>
                    {exercise.type === "sparring" && (
                      <span className="intensity-badge">{intensityLabels[exercise.intensity].toUpperCase()}</span>
                    )}
                  </div>
                  <b>{exercise.name}</b>
                  <span className="shared-exercise-detail">
                    <Clock3 size={13} />
                    {formatVolume(exercise)}
                    <span className="shared-round-label">ROUND {String(index + 1).padStart(2, "0")}</span>
                  </span>
                  {hasCombinations(exercise) &&
                    exercise.combinations.map((combination, comboIndex) => (
                      <small key={combination.id}>
                        <span className="combo-marker">COMBO {String(comboIndex + 1).padStart(2, "0")}</span>
                        {formatCombo(combination)}
                      </small>
                    ))}
                  {exercise.notes && (
                    <small>
                      <span className="combo-marker">{exercise.type === "sparring" ? "REGRAS" : "NOTAS"}</span>
                      {exercise.notes}
                    </small>
                  )}
                </div>
                <span className="station-ready">PRONTO</span>
              </section>
            ))}
          </div>

          <footer className="shared-footer">
            <Shield size={14} /> Este treino foi compartilhado para visualização.
            <a href="/">
              Ir para meu espaço <span>↗</span>
            </a>
          </footer>
        </article>
      )}
    </main>
  )
}
