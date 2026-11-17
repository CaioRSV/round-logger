"use client"

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  X,
} from "lucide-react"
import { useEffect, useMemo, useReducer, useRef, useState } from "react"

import { formatCombo } from "@/lib/format"
import {
  DEFAULT_REST_SECONDS,
  MAX_COMBO_INTERVAL_S,
  MIN_COMBO_INTERVAL_S,
  PREP_MS,
  buildPhases,
  comboIndex,
  comboRemainingMs,
  defaultComboIntervalSeconds,
  initialTimerState,
  timerReducer,
  type Phase,
  type TimerAction,
  type TimerConfig,
} from "@/lib/timer"
import { beep, bell, clapper, speak, speakableLabel, stopSpeaking, unlockAudio } from "@/lib/timer-audio"
import { hasCombinations, type Combination, type TimedExercise } from "@/lib/types"

const MUTE_KEY = "round-logger.timer.muted"

function loadMuted(): boolean {
  try {
    return window.localStorage.getItem(MUTE_KEY) === "1"
  } catch {
    return false
  }
}

function saveMuted(value: boolean): void {
  try {
    window.localStorage.setItem(MUTE_KEY, value ? "1" : "0")
  } catch {
    // armazenamento indisponível
  }
}

function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

function formatSeconds(seconds: number): string {
  if (seconds === 0) return "Sem"
  if (seconds < 60) return `${seconds}s`
  const rest = seconds % 60
  return rest ? `${Math.floor(seconds / 60)}m${String(rest).padStart(2, "0")}` : `${seconds / 60} min`
}

function comboSpeech(combination: Combination, index: number): string {
  return `Combinação ${index + 1}. ${combination.techniques.map((technique) => speakableLabel(technique.label)).join(", ")}.`
}

function phaseLabel(phase: Phase, finished: boolean): string {
  if (finished) return "CONCLUÍDO"
  if (phase.kind === "prep") return "PREPARE-SE"
  if (phase.kind === "work") return `ROUND ${phase.round}`
  if (phase.kind === "switch") return "TROCA"
  return "DESCANSO"
}

type StepperProps = {
  label: string
  value: string
  onDec: () => void
  onInc: () => void
  decDisabled?: boolean
  incDisabled?: boolean
}

function Stepper({ label, value, onDec, onInc, decDisabled, incDisabled }: StepperProps) {
  return (
    <div className="timer-stepper">
      <span>{label}</span>
      <div>
        <button type="button" onClick={onDec} disabled={decDisabled} aria-label={`Diminuir ${label}`}>
          −
        </button>
        <b>{value}</b>
        <button type="button" onClick={onInc} disabled={incDisabled} aria-label={`Aumentar ${label}`}>
          +
        </button>
      </div>
    </div>
  )
}

type TimerPlayerProps = {
  exercise: TimedExercise
  sessionTitle: string
  onClose: () => void
  onUpdate: (patch: { restSeconds?: number; repeat?: number }) => void
  /** Ausente em páginas somente leitura (ex.: plano compartilhado). */
  onMarkDone?: () => void
}

export function TimerPlayer({ exercise, sessionTitle, onClose, onUpdate, onMarkDone }: TimerPlayerProps) {
  const combos = useMemo(
    () => (hasCombinations(exercise) ? exercise.combinations.filter((combination) => combination.techniques.length > 0) : []),
    [exercise],
  )
  const [restSeconds, setRestSeconds] = useState(exercise.restSeconds ?? DEFAULT_REST_SECONDS)
  const [repeat, setRepeat] = useState(exercise.repeat ?? 1)
  const [comboSeconds, setComboSeconds] = useState(() =>
    defaultComboIntervalSeconds(exercise.rounds, exercise.durationMinutes, combos.length),
  )
  const [muted, setMuted] = useState(loadMuted)
  const [showSettings, setShowSettings] = useState(false)

  const phases = useMemo(() => buildPhases(exercise.rounds, repeat), [exercise.rounds, repeat])
  const cfg: TimerConfig = useMemo(
    () => ({
      phases,
      prepMs: PREP_MS,
      workMs: exercise.durationMinutes * 60_000,
      restMs: restSeconds * 1000,
      comboCount: combos.length,
      comboIntervalMs: comboSeconds * 1000,
    }),
    [phases, exercise.durationMinutes, restSeconds, combos.length, comboSeconds],
  )
  const cfgRef = useRef(cfg)
  cfgRef.current = cfg

  const [state, dispatch] = useReducer(timerReducer, cfg, initialTimerState)
  const send = (action: TimerAction) => dispatch({ action, cfg: cfgRef.current })

  const finished = state.status === "finished"
  const running = state.status === "running"
  const phase = phases[Math.min(state.index, phases.length - 1)]
  const remainingMs = Math.max(0, state.phaseTotalMs - state.phaseElapsedMs)
  const secondsLeft = Math.ceil(remainingMs / 1000)
  const phaseProgress = state.phaseTotalMs > 0 ? Math.min(state.phaseElapsedMs / state.phaseTotalMs, 1) : 1
  const comboIdx = comboIndex(state, cfg)
  const combo = combos[comboIdx]
  const nextCombo = combos.length > 1 ? combos[(comboIdx + 1) % combos.length] : undefined
  const comboLeftS = Math.ceil(comboRemainingMs(state, cfg) / 1000)
  const workPhases = phases.map((item, index) => ({ ...item, index })).filter((item) => item.kind === "work")

  // Relógio: ticks a cada 200ms enquanto roda; ao voltar para a aba, atualiza na hora.
  useEffect(() => {
    if (!running) return
    const tick = () => dispatch({ action: { type: "tick", now: Date.now() }, cfg: cfgRef.current })
    const id = window.setInterval(tick, 200)
    document.addEventListener("visibilitychange", tick)
    return () => {
      window.clearInterval(id)
      document.removeEventListener("visibilitychange", tick)
    }
  }, [running])

  // Mantém a tela acesa enquanto o timer roda (quando suportado).
  useEffect(() => {
    if (!running) return
    type WakeLockLike = { release: () => Promise<void> }
    const nav = navigator as Navigator & { wakeLock?: { request: (type: "screen") => Promise<WakeLockLike> } }
    let lock: WakeLockLike | null = null
    let cancelled = false
    nav.wakeLock
      ?.request("screen")
      .then((acquired) => {
        if (cancelled) void acquired.release().catch(() => {})
        else lock = acquired
      })
      .catch(() => {})
    return () => {
      cancelled = true
      void lock?.release().catch(() => {})
    }
  }, [running])

  // Trava o scroll da página por trás do player.
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
      stopSpeaking()
    }
  }, [])

  // Narração: início de fase, troca de combinação e fim do treino.
  const announced = useRef({ index: state.index, status: state.status, combo: comboIdx })
  useEffect(() => {
    const previous = announced.current
    announced.current = { index: state.index, status: state.status, combo: comboIdx }
    if (muted) return
    if (finished) {
      if (previous.status !== "finished") {
        bell()
        speak("Treino concluído. Bom trabalho!")
      }
      return
    }
    const phaseStarted = running && (previous.index !== state.index || previous.status === "idle")
    if (phaseStarted) {
      if (phase.kind === "prep") speak("Prepare-se.")
      if (phase.kind === "work") {
        bell()
        const block = repeat > 1 ? `, bloco ${phase.block}` : ""
        speak(`Round ${phase.round}${block}.${combo ? ` ${comboSpeech(combo, comboIdx)}` : ""}`)
      }
      if (phase.kind === "rest") {
        beep(660, 380)
        speak("Descanso.")
      }
      if (phase.kind === "switch") {
        beep(660, 380)
        speak(`Troca! Próximo: bloco ${phase.block + 1} de ${repeat}.`)
      }
      return
    }
    if (previous.combo !== comboIdx && combo && combos.length > 1) {
      if (running) beep(1320, 90, 0.15)
      speak(comboSpeech(combo, comboIdx))
    }
  }, [state.index, state.status, comboIdx]) // eslint-disable-line react-hooks/exhaustive-deps

  // Contagem regressiva: bipes nos 3 últimos segundos e "batida" aos 10s do round.
  const lastSecond = useRef(secondsLeft)
  useEffect(() => {
    const previous = lastSecond.current
    lastSecond.current = secondsLeft
    if (!running || muted || previous === secondsLeft) return
    if (secondsLeft >= 1 && secondsLeft <= 3) beep(880, 120, 0.22)
    if (secondsLeft === 10 && phase.kind === "work" && state.phaseTotalMs >= 30_000) clapper()
  }, [secondsLeft, running, muted, phase.kind, state.phaseTotalMs])

  // Teclado (desktop): Esc fecha, espaço play/pause.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestClose()
      if (event.key === " " && !(event.target instanceof HTMLButtonElement || event.target instanceof HTMLInputElement)) {
        event.preventDefault()
        togglePlay()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  function togglePlay() {
    unlockAudio()
    if (running) send({ type: "pause", now: Date.now() })
    else send({ type: "start", now: Date.now() })
  }

  function requestClose() {
    const inProgress = state.status !== "idle" && !finished
    if (inProgress && !window.confirm("Sair do timer? O progresso deste treino será perdido.")) return
    onClose()
  }

  function toggleMute() {
    const next = !muted
    setMuted(next)
    saveMuted(next)
    if (next) stopSpeaking()
    else unlockAudio()
  }

  function changeRest(delta: number) {
    const next = Math.min(300, Math.max(0, restSeconds + delta))
    setRestSeconds(next)
    onUpdate({ restSeconds: next })
  }

  function changeRepeat(delta: number) {
    const next = Math.min(6, Math.max(phase.block, repeat + delta, 1))
    setRepeat(next)
    onUpdate({ repeat: next })
  }

  function changeComboInterval(delta: number) {
    send({ type: "rebaseCombo" }) // com o intervalo antigo, antes de trocar
    setComboSeconds((current) => Math.min(MAX_COMBO_INTERVAL_S, Math.max(MIN_COMBO_INTERVAL_S, current + delta)))
  }

  const skipLabel = phase.kind === "work" ? "Encerrar round" : phase.kind === "prep" ? "Pular preparo" : "Pular descanso"
  const dataPhase = finished ? "done" : phase.kind

  return (
    <div className="timer-overlay" data-phase={dataPhase} role="dialog" aria-modal="true" aria-label={`Timer: ${exercise.name}`}>
      <header className="timer-head">
        <div className="timer-title">
          <span>{sessionTitle}</span>
          <b>{exercise.name}</b>
        </div>
        <button
          type="button"
          className="timer-icon"
          onClick={toggleMute}
          aria-pressed={muted}
          aria-label={muted ? "Ativar som e voz" : "Silenciar som e voz"}
          title={muted ? "Ativar som" : "Silenciar"}
        >
          {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
        </button>
        <button
          type="button"
          className={`timer-icon ${showSettings ? "active" : ""}`}
          onClick={() => setShowSettings((current) => !current)}
          aria-expanded={showSettings}
          aria-label="Ajustes do timer"
        >
          <SlidersHorizontal size={17} />
        </button>
        <button type="button" className="timer-icon" onClick={requestClose} aria-label="Fechar timer">
          <X size={18} />
        </button>
      </header>

      {showSettings && (
        <div className="timer-settings">
          <Stepper
            label="Descanso"
            value={formatSeconds(restSeconds)}
            onDec={() => changeRest(-15)}
            onInc={() => changeRest(15)}
            decDisabled={restSeconds <= 0}
            incDisabled={restSeconds >= 300}
          />
          <Stepper
            label="Repetir rounds"
            value={`${repeat}×`}
            onDec={() => changeRepeat(-1)}
            onInc={() => changeRepeat(1)}
            decDisabled={repeat <= Math.max(1, phase.block)}
            incDisabled={repeat >= 6}
          />
          {combos.length > 1 && (
            <Stepper
              label="Combo a cada"
              value={`${comboSeconds}s`}
              onDec={() => changeComboInterval(-5)}
              onInc={() => changeComboInterval(5)}
              decDisabled={comboSeconds <= MIN_COMBO_INTERVAL_S}
              incDisabled={comboSeconds >= MAX_COMBO_INTERVAL_S}
            />
          )}
        </div>
      )}

      <main className="timer-stage">
        <div className="timer-phase">{phaseLabel(phase, finished)}</div>
        <div className="timer-sub">
          {exercise.rounds} × {exercise.durationMinutes} min
          {repeat > 1 && ` · bloco ${phase.block}/${repeat}`}
          {phase.kind === "switch" && !finished && " · troque com o parceiro"}
        </div>
        <div className="timer-clock" aria-live="off">
          {formatClock(finished ? 0 : remainingMs)}
        </div>
        <div className="timer-bar">
          <span style={{ width: `${(finished ? 1 : phaseProgress) * 100}%` }} />
        </div>
        <div className="timer-track" aria-label="Rounds">
          {Array.from({ length: repeat }, (_, blockIndex) => (
            <div key={blockIndex} className="timer-track-block">
              {workPhases
                .filter((item) => item.block === blockIndex + 1)
                .map((item) => (
                  <i
                    key={item.index}
                    className={finished || item.index < state.index ? "done" : item.index === state.index ? "current" : ""}
                  />
                ))}
            </div>
          ))}
        </div>

        {combo && (
          <section className="timer-combo" aria-live="polite">
            {combos.length > 1 && (
              <button type="button" className="timer-combo-nav" onClick={() => send({ type: "shiftCombo", delta: -1 })} aria-label="Combinação anterior">
                <ChevronLeft size={22} />
              </button>
            )}
            <div className="timer-combo-body">
              <span className="timer-combo-kicker">
                COMBO {comboIdx + 1}/{combos.length}
                {combos.length > 1 && phase.kind === "work" && !finished && <em> · troca em {comboLeftS}s</em>}
              </span>
              <div className="timer-combo-techs">
                {combo.techniques.map((technique, index) => (
                  <span key={technique.id}>
                    <i>{index + 1}</i>
                    {technique.label}
                  </span>
                ))}
              </div>
              {nextCombo && <small>Próxima: {formatCombo(nextCombo)}</small>}
            </div>
            {combos.length > 1 && (
              <button type="button" className="timer-combo-nav" onClick={() => send({ type: "shiftCombo", delta: 1 })} aria-label="Próxima combinação">
                <ChevronRight size={22} />
              </button>
            )}
          </section>
        )}
      </main>

      {finished ? (
        <footer className="timer-controls timer-finished">
          {onMarkDone && !exercise.done && (
            <button type="button" className="timer-primary-wide" onClick={onMarkDone}>
              <Check size={17} /> Marcar como feito
            </button>
          )}
          <button type="button" className="timer-ctrl wide" onClick={() => send({ type: "reset" })}>
            <RotateCcw size={16} /> Recomeçar
          </button>
        </footer>
      ) : (
        <footer className="timer-controls">
          <div className="timer-main-row">
            <button type="button" className="timer-ctrl" onClick={() => send({ type: "addTime", ms: 30_000 })} aria-label="Adicionar 30 segundos">
              <b>+30s</b>
            </button>
            <button type="button" className="timer-play" onClick={togglePlay} aria-label={running ? "Pausar" : "Iniciar"}>
              {running ? <Pause size={34} /> : <Play size={34} />}
            </button>
            <button type="button" className="timer-ctrl" onClick={() => send({ type: "endPhase" })} aria-label={skipLabel}>
              <SkipForward size={20} />
            </button>
          </div>
          <div className="timer-minor-row">
            <button type="button" onClick={() => send({ type: "addTime", ms: 60_000 })}>
              +1 min
            </button>
            <button type="button" onClick={() => send({ type: "endPhase" })}>
              {skipLabel}
            </button>
            <button type="button" onClick={() => send({ type: "reset" })} disabled={state.status === "idle" && state.index === 0}>
              Reiniciar
            </button>
          </div>
        </footer>
      )}
    </div>
  )
}
