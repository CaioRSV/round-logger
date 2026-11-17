import { ArrowUpRight, Check, Copy, Share2, Shield, X } from "lucide-react"
import { useEffect, useState } from "react"

import { ExerciseIcon } from "@/components/exercise-icon"
import { formatLongDate, formatShortDate } from "@/lib/dates"
import { formatCombo, formatVolume, intensityLabels } from "@/lib/format"
import { shareUrl } from "@/lib/share-link"
import type { Session } from "@/lib/types"
import { hasCombinations } from "@/lib/types"

type ShareDialogProps = {
  session: Session
  onClose: () => void
}

export function ShareDialog({ session, onClose }: ShareDialogProps) {
  const [copied, setCopied] = useState(false)
  const [preview, setPreview] = useState(false)
  const [url, setUrl] = useState<string | null>(null)
  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function"

  useEffect(() => {
    let cancelled = false
    void shareUrl(session).then((value) => {
      if (!cancelled) setUrl(value)
    })
    return () => {
      cancelled = true
    }
  }, [session])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  async function copyLink() {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="modal share-modal" role="dialog" aria-modal="true" aria-labelledby="share-title">
        <div className="modal-head">
          <div>
            <div className="section-kicker">{preview ? "VISUALIZAÇÃO COMPARTILHADA" : "COMPARTILHAR SESSÃO"}</div>
            <h2 id="share-title">{preview ? "Plano de treino" : "Compartilhe o plano"}</h2>
          </div>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>
        {preview ? (
          <div className="read-only-view">
            <div className="share-preview-top">
              <span>{session.kind}</span>
              <span>{formatLongDate(session.date)}</span>
            </div>
            <h3>{session.title}</h3>
            {session.notes && <p className="shared-notes">{session.notes}</p>}
            {session.exercises.map((exercise) => (
              <div className="shared-exercise" key={exercise.id}>
                <div className="exercise-type-icon">
                  <ExerciseIcon type={exercise.type} />
                </div>
                <div>
                  <b>{exercise.name}</b>
                  <span>
                    {formatVolume(exercise)}
                    {exercise.type === "sparring" ? ` · ${intensityLabels[exercise.intensity]}` : ""}
                  </span>
                  {hasCombinations(exercise) && exercise.combinations.map((combination) => <small key={combination.id}>{formatCombo(combination)}</small>)}
                  {exercise.notes && <small>{exercise.notes}</small>}
                </div>
              </div>
            ))}
            <div className="read-only-label">
              <Shield size={13} /> PLANO COMPARTILHADO · SOMENTE LEITURA
            </div>
            <button className="cancel-btn" type="button" onClick={() => setPreview(false)}>
              Voltar ao compartilhamento
            </button>
          </div>
        ) : (
          <div className="share-body">
            <div className="share-preview">
              <div className="share-preview-top">
                <span>{session.kind}</span>
                <span>{formatShortDate(session.date)}</span>
              </div>
              <b>{session.title}</b>
              <span>{session.exercises.length} exercícios · somente leitura</span>
            </div>
            <p>
              Qualquer pessoa com este link pode ver o plano e usar o timer, sem criar uma conta. O treino vai comprimido dentro do próprio link — nada é enviado para um servidor.
            </p>
            <div className="share-link">
              <span className="share-link-url" title={url ?? undefined}>
                {url ? url.replace(/^https?:\/\//, "") : "Gerando link…"}
              </span>
              <button type="button" disabled={!url} onClick={() => void copyLink()}>
                {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? "Copiado" : "Copiar link"}
              </button>
            </div>
            {canNativeShare && url && (
              <button
                className="read-only-btn"
                type="button"
                onClick={() => void navigator.share({ title: session.title, text: `Treino: ${session.title}`, url }).catch(() => {})}
              >
                <Share2 size={15} /> Enviar pelo celular (WhatsApp, etc.)
              </button>
            )}
            {url && (
              <a className="read-only-btn" href={url} target="_blank" rel="noreferrer">
                <ArrowUpRight size={15} /> Abrir página compartilhada
              </a>
            )}
            <button className="read-only-btn" type="button" onClick={() => setPreview(true)}>
              <ArrowUpRight size={15} /> Pré-visualizar aqui
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
