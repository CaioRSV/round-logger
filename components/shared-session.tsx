"use client"

import { CalendarDays, Clock3, Shield, Swords } from "lucide-react"
import { useEffect, useState } from "react"

import { ExerciseIcon } from "@/components/exercise-icon"
import { formatLongDate } from "@/lib/dates"
import { exerciseTypeLabels, formatCombo, formatVolume, intensityLabels } from "@/lib/format"
import { decodeSharePayload, findStoredSession } from "@/lib/storage"
import type { Session } from "@/lib/types"

function readHashPayload(): Session | null {
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

  useEffect(() => {
    setSession(readHashPayload() ?? findStoredSession(id))
  }, [id])

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
        <span className="shared-label">
          <Shield size={13} /> PLANO COMPARTILHADO
        </span>
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
            O link completo traz o plano nele mesmo. Se você abriu só o endereço curto, o treino precisa existir no log local deste aparelho.
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
                    <span>{exerciseTypeLabels[exercise.type].toUpperCase()}</span>
                    {exercise.type === "sparring" && <span className="intensity-badge">{intensityLabels[exercise.intensity].toUpperCase()}</span>}
                  </div>
                  <b>{exercise.name}</b>
                  <span className="shared-exercise-detail">
                    <Clock3 size={13} />
                    {formatVolume(exercise)}
                    <span className="shared-round-label">ROUND {String(index + 1).padStart(2, "0")}</span>
                  </span>
                  {exercise.type === "pad-work" &&
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
              Criar seu próprio registro <span>↗</span>
            </a>
          </footer>
        </article>
      )}
    </main>
  )
}
