// Motor do "Timer Play": lógica pura (sem React) para fases, tempo e rotação de combinações.
// O tempo é acumulado por delta entre ticks, então continua preciso mesmo com o navegador
// segurando timers em segundo plano (vários ticks atrasados avançam várias fases de uma vez).

export type PhaseKind = "prep" | "work" | "rest" | "switch"

export type Phase = {
  kind: PhaseKind
  round: number // 1..rounds (0 no preparo)
  block: number // 1..repeat
}

export type TimerConfig = {
  phases: Phase[]
  prepMs: number
  workMs: number
  restMs: number
  comboCount: number
  comboIntervalMs: number
}

export type TimerStatus = "idle" | "running" | "paused" | "finished"

export type TimerState = {
  status: TimerStatus
  index: number
  phaseTotalMs: number
  phaseElapsedMs: number
  lastTick: number
  /** Tempo de trabalho (rounds) já concluído, sem contar a fase atual. */
  workElapsedMs: number
  comboStartIdx: number
  comboBaseMs: number
}

export const PREP_MS = 10_000
export const DEFAULT_REST_SECONDS = 60
export const MIN_COMBO_INTERVAL_S = 10
export const MAX_COMBO_INTERVAL_S = 60 // no mínimo 1 combinação por minuto

export function buildPhases(rounds: number, repeat: number): Phase[] {
  const phases: Phase[] = [{ kind: "prep", round: 0, block: 1 }]
  for (let block = 1; block <= repeat; block++) {
    for (let round = 1; round <= rounds; round++) {
      phases.push({ kind: "work", round, block })
      const lastRound = round === rounds
      const lastBlock = block === repeat
      if (lastRound && lastBlock) continue
      phases.push({ kind: lastRound ? "switch" : "rest", round, block })
    }
  }
  return phases
}

/** Intervalo padrão: espalha as combinações pelo bloco, entre 10s e 60s. */
export function defaultComboIntervalSeconds(rounds: number, durationMinutes: number, comboCount: number): number {
  if (comboCount <= 1) return MAX_COMBO_INTERVAL_S
  const spread = Math.round((rounds * durationMinutes * 60) / comboCount / 5) * 5
  return Math.min(MAX_COMBO_INTERVAL_S, Math.max(MIN_COMBO_INTERVAL_S, spread))
}

export function phaseDuration(phase: Phase | undefined, cfg: TimerConfig): number {
  if (!phase) return 0
  if (phase.kind === "prep") return cfg.prepMs
  if (phase.kind === "work") return cfg.workMs
  return cfg.restMs
}

export function initialTimerState(cfg: TimerConfig): TimerState {
  return {
    status: "idle",
    index: 0,
    phaseTotalMs: phaseDuration(cfg.phases[0], cfg),
    phaseElapsedMs: 0,
    lastTick: 0,
    workElapsedMs: 0,
    comboStartIdx: 0,
    comboBaseMs: 0,
  }
}

function currentWorkMs(s: TimerState, cfg: TimerConfig): number {
  const phase = cfg.phases[s.index]
  const inPhase = phase?.kind === "work" ? Math.min(s.phaseElapsedMs, s.phaseTotalMs) : 0
  return s.workElapsedMs + inPhase
}

export function comboIndex(s: TimerState, cfg: TimerConfig): number {
  if (cfg.comboCount <= 0) return 0
  const steps = Math.floor((currentWorkMs(s, cfg) - s.comboBaseMs) / cfg.comboIntervalMs)
  return (((s.comboStartIdx + steps) % cfg.comboCount) + cfg.comboCount) % cfg.comboCount
}

/** Ms até a próxima troca automática de combinação (dentro do tempo de trabalho). */
export function comboRemainingMs(s: TimerState, cfg: TimerConfig): number {
  const into = (currentWorkMs(s, cfg) - s.comboBaseMs) % cfg.comboIntervalMs
  return cfg.comboIntervalMs - into
}

function advance(s: TimerState, cfg: TimerConfig, overflowMs: number): TimerState {
  const workElapsedMs = currentWorkMs(s, cfg)
  let next = s.index + 1
  while (next < cfg.phases.length && phaseDuration(cfg.phases[next], cfg) <= 0) next++
  if (next >= cfg.phases.length) {
    return { ...s, status: "finished", workElapsedMs, phaseElapsedMs: s.phaseTotalMs }
  }
  return {
    ...s,
    index: next,
    workElapsedMs,
    phaseTotalMs: phaseDuration(cfg.phases[next], cfg),
    phaseElapsedMs: overflowMs,
  }
}

export type TimerAction =
  | { type: "start"; now: number }
  | { type: "pause"; now: number }
  | { type: "tick"; now: number }
  | { type: "addTime"; ms: number }
  | { type: "endPhase" }
  | { type: "reset" }
  | { type: "shiftCombo"; delta: number }
  | { type: "rebaseCombo" }

function reduceTimer(cfg: TimerConfig, s: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case "start": {
      const base = s.status === "finished" ? initialTimerState(cfg) : s
      return { ...base, status: "running", lastTick: action.now }
    }
    case "pause": {
      if (s.status !== "running") return s
      return { ...reduceTimer(cfg, s, { type: "tick", now: action.now }), status: "paused" }
    }
    case "tick": {
      if (s.status !== "running") return s
      let state: TimerState = {
        ...s,
        phaseElapsedMs: s.phaseElapsedMs + Math.max(0, action.now - s.lastTick),
        lastTick: action.now,
      }
      while (state.status === "running" && state.phaseElapsedMs >= state.phaseTotalMs) {
        state = advance(state, cfg, state.phaseElapsedMs - state.phaseTotalMs)
      }
      return state
    }
    case "addTime":
      if (s.status === "finished") return s
      return { ...s, phaseTotalMs: s.phaseTotalMs + action.ms }
    case "endPhase":
      if (s.status === "finished") return s
      return advance(s, cfg, 0)
    case "reset":
      return initialTimerState(cfg)
    case "shiftCombo": {
      if (cfg.comboCount <= 0) return s
      return {
        ...s,
        comboStartIdx: comboIndex(s, cfg) + action.delta,
        comboBaseMs: currentWorkMs(s, cfg),
      }
    }
    case "rebaseCombo":
      // Mantém a combinação atual ao mudar o intervalo e reinicia a contagem dela.
      return { ...s, comboStartIdx: comboIndex(s, cfg), comboBaseMs: currentWorkMs(s, cfg) }
    default:
      return s
  }
}

/** Cada mensagem carrega a configuração vigente no momento do dispatch. */
export type TimerMessage = { action: TimerAction; cfg: TimerConfig }

export function timerReducer(s: TimerState, { action, cfg }: TimerMessage): TimerState {
  return reduceTimer(cfg, s, action)
}
