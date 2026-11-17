// Sons e voz do Timer Play. Tudo é opcional: se o navegador não suportar, falha em silêncio.
// O AudioContext precisa ser "destravado" por um toque do usuário (iOS), por isso unlock().

let ctx: AudioContext | null = null

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    try {
      ctx = new Ctor()
    } catch {
      return null
    }
  }
  return ctx
}

/** Chamar dentro de um clique (ex.: Play) para liberar áudio e voz no mobile. */
export function unlockAudio(): void {
  const context = audio()
  if (context?.state === "suspended") void context.resume()
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    // Uma fala vazia dentro do gesto libera o speechSynthesis no iOS.
    const warmup = new SpeechSynthesisUtterance("")
    warmup.volume = 0
    window.speechSynthesis.speak(warmup)
  }
}

export function beep(frequency = 880, durationMs = 160, volume = 0.25, delayMs = 0): void {
  const context = audio()
  if (!context) return
  const start = context.currentTime + delayMs / 1000
  const osc = context.createOscillator()
  const gain = context.createGain()
  osc.type = "sine"
  osc.frequency.value = frequency
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + durationMs / 1000)
  osc.connect(gain).connect(context.destination)
  osc.start(start)
  osc.stop(start + durationMs / 1000 + 0.05)
}

/** Sino de início de round: três toques. */
export function bell(): void {
  beep(1046, 420, 0.3)
  beep(1046, 420, 0.3, 450)
  beep(1046, 600, 0.3, 900)
}

/** Aviso dos 10 segundos finais: duas batidas secas. */
export function clapper(): void {
  beep(1600, 70, 0.3)
  beep(1600, 70, 0.3, 140)
}

function ptVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices()
  return voices.find((voice) => voice.lang === "pt-BR") ?? voices.find((voice) => voice.lang.startsWith("pt"))
}

export function speak(text: string, { interrupt = true }: { interrupt?: boolean } = {}): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return
  try {
    if (interrupt) window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "pt-BR"
    utterance.rate = 1.05
    const voice = ptVoice()
    if (voice) utterance.voice = voice
    window.speechSynthesis.speak(utterance)
  } catch {
    // sem voz disponível
  }
}

export function stopSpeaking(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel()
}

/** Remove anotações entre parênteses para a leitura ficar natural ("Teep frontal (perna da frente)" → "Teep frontal"). */
export function speakableLabel(label: string): string {
  return label.replace(/\s*\([^)]*\)/g, "").replace(/\s*\/\s*/g, " ou ").trim()
}
