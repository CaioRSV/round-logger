// Sistema de ranks: 4 ranks maiores, cada um com níveis em algarismos romanos.
// O progresso é medido em treinos registrados (sessões concluídas ou parciais).
// Os intervalos entre ranks crescem aos poucos (5 → 40 treinos), sem ficar absurdos.

export type MajorRank = "novato" | "intermediario" | "avancado" | "lutador"

export interface RankTheme {
  name: string
  cardBg: string
  cardBorder: string
  boxGlow: string
  dotPattern: string
  eyebrowText: string
  liveDotColor: string
  liveDotShadow: string
  separatorColor: string
  headingText: string
  headingAccent: string
  textColor: string
  progressTrackBg: string
  progressFill: string
  progressGlow: string
  stampBg: string
  stampBorder: string
  stampText: string
  badgeBg: string
  badgeBorder: string
  badgeText: string
}

export interface RankDefinition {
  id: string
  name: string
  major: MajorRank
  majorName: string
  level: number // 1 = I, 2 = II...
  tierNumber: number // 1 a 14, posição global
  minWorkouts: number
  maxWorkouts: number | null // null = último rank
  theme: RankTheme
}

/* ------------------------------------------------------------------ */
/* Paletas: cada rank maior tem sua cor; o nível interpola de "low"   */
/* (nível I) até "high" (último nível), ficando mais intenso.         */
/* ------------------------------------------------------------------ */

type PaletteStop = {
  spot: string // brilho radial do canto
  bg: string // fundo principal
  border: string
  accent: string // eyebrow, destaque do título, ponto ao vivo
  text: string
  track: string
  fill: string
  heading: string
}

type Palette = { name: string; low: PaletteStop; high: PaletteStop; glowStart: number; glowEnd: number }

const palettes: Record<MajorRank, Palette> = {
  // Cinza aço: fosco, discreto
  novato: {
    name: "Aço fosco",
    glowStart: 0,
    glowEnd: 12,
    low: { spot: "#272b27", bg: "#1b1c1b", border: "#2f342e", accent: "#9aa395", text: "#9aa095", track: "#292e28", fill: "#8e9687", heading: "#e3e6e0" },
    high: { spot: "#2d3438", bg: "#1d2124", border: "#3e474c", accent: "#bac6cd", text: "#a9b2b7", track: "#2e363b", fill: "#c6d1d7", heading: "#eef2f4" },
  },
  // Azul cobalto
  intermediario: {
    name: "Azul cobalto",
    glowStart: 14,
    glowEnd: 24,
    low: { spot: "#1a2c48", bg: "#161c26", border: "#283a57", accent: "#6f9be0", text: "#9eabc0", track: "#22314a", fill: "#79a6f0", heading: "#eaf1ff" },
    high: { spot: "#1f3f74", bg: "#172136", border: "#3a5b94", accent: "#93bcff", text: "#b6c6df", track: "#2a426e", fill: "#a9cbff", heading: "#f3f7ff" },
  },
  // Vermelho combate
  avancado: {
    name: "Vermelho combate",
    glowStart: 20,
    glowEnd: 32,
    low: { spot: "#4a1c1a", bg: "#2b1716", border: "#562b28", accent: "#e6766a", text: "#ba9b95", track: "#4a2623", fill: "#f08a78", heading: "#fff0eb" },
    high: { spot: "#821a15", bg: "#461413", border: "#a02b22", accent: "#ff6656", text: "#dbb8b1", track: "#6a201b", fill: "#ffa184", heading: "#fff4f0" },
  },
  // Dourado premium: o rank final (ouro mais saturado, brilho mais forte)
  lutador: {
    name: "Ouro",
    glowStart: 34,
    glowEnd: 56,
    low: { spot: "#6b4d0e", bg: "#2a1f0a", border: "#b8892a", accent: "#ffc93c", text: "#e2d2a8", track: "#4a3509", fill: "#ffcf4a", heading: "#fff4cf" },
    high: { spot: "#9a6f12", bg: "#3a2a0b", border: "#f2c445", accent: "#ffe27a", text: "#f2e6c4", track: "#5e430b", fill: "#ffe98f", heading: "#fffaea" },
  },
}

function hexToRgb(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

function mix(a: string, b: string, t: number): string {
  const ca = hexToRgb(a)
  const cb = hexToRgb(b)
  return `#${ca
    .map((channel, index) => Math.round(channel + (cb[index] - channel) * t).toString(16).padStart(2, "0"))
    .join("")}`
}

function buildTheme(major: MajorRank, level: number, levels: number): RankTheme {
  const palette = palettes[major]
  const t = levels <= 1 ? 1 : (level - 1) / (levels - 1)
  const c = Object.fromEntries(
    (Object.keys(palette.low) as (keyof PaletteStop)[]).map((key) => [key, mix(palette.low[key], palette.high[key], t)]),
  ) as PaletteStop
  const glow = Math.round(palette.glowStart + (palette.glowEnd - palette.glowStart) * t)
  const spotSize = Math.round(40 + 14 * t)
  const shine = major === "lutador" ? `#ffe9a0${Math.round(0x40 + 0x30 * t).toString(16)}` : "#ffffff0a"

  return {
    name: `${palette.name} ${toRoman(level)}`,
    cardBg: `radial-gradient(ellipse at 15% 15%, ${c.spot} 0, transparent ${spotSize}%), linear-gradient(105deg, ${c.bg} 0, ${mix(c.bg, "#151614", 0.45)} 51%, #121311 100%)`,
    cardBorder: c.border,
    boxGlow:
      major === "lutador"
        ? `0 0 ${glow}px ${c.border}66, 0 0 ${Math.round(glow / 3)}px ${c.accent}33, inset 0 1px ${shine}, inset 0 0 24px ${c.spot}55`
        : glow > 0
          ? `0 0 ${glow}px ${c.border}44, inset 0 1px ${shine}`
          : `inset 0 1px ${shine}`,
    dotPattern: c.accent,
    eyebrowText: c.accent,
    liveDotColor: c.accent,
    liveDotShadow: `0 0 ${6 + Math.round(10 * t)}px ${c.accent}aa`,
    separatorColor: mix(c.border, c.accent, 0.35),
    headingText: c.heading,
    headingAccent: mix(c.accent, c.heading, 0.15),
    textColor: c.text,
    progressTrackBg: c.track,
    progressFill: c.fill,
    progressGlow: major === "novato" ? "none" : `0 0 ${8 + Math.round(8 * t)}px ${c.fill}66`,
    stampBg: mix(c.bg, "#000000", 0.15),
    stampBorder: c.border,
    stampText: c.accent,
    badgeBg: mix(c.bg, c.accent, 0.08),
    badgeBorder: c.border,
    badgeText: mix(c.accent, c.heading, 0.2),
  }
}

export function toRoman(value: number): string {
  return ["", "I", "II", "III", "IV", "V", "VI"][value] ?? String(value)
}

/* ------------------------------------------------------------------ */
/* Definição dos ranks                                                */
/* ------------------------------------------------------------------ */

type RankSeed = {
  major: MajorRank
  minWorkouts: number
}

const majorNames: Record<MajorRank, string> = {
  novato: "Novato",
  intermediario: "Intermediário",
  avancado: "Avançado",
  lutador: "Lutador",
}

// Intervalos: 5, 7, 8, 10, 12, 14, 16, 18, 20, 25, 30, 35, 40
const seeds: RankSeed[] = [
  { major: "novato", minWorkouts: 0 },
  { major: "novato", minWorkouts: 5 },
  { major: "intermediario", minWorkouts: 12 },
  { major: "intermediario", minWorkouts: 20 },
  { major: "intermediario", minWorkouts: 30 },
  { major: "avancado", minWorkouts: 42 },
  { major: "avancado", minWorkouts: 56 },
  { major: "avancado", minWorkouts: 72 },
  { major: "avancado", minWorkouts: 90 },
  { major: "lutador", minWorkouts: 110 },
  { major: "lutador", minWorkouts: 135 },
  { major: "lutador", minWorkouts: 165 },
  { major: "lutador", minWorkouts: 200 },
  { major: "lutador", minWorkouts: 240 },
]

export const RANKS: RankDefinition[] = seeds.map((seed, index) => {
  const sameMajor = seeds.filter((item) => item.major === seed.major)
  const level = sameMajor.indexOf(seed) + 1
  const next = seeds[index + 1]
  return {
    id: `${seed.major}-${level}`,
    name: `${majorNames[seed.major]} ${toRoman(level)}`,
    major: seed.major,
    majorName: majorNames[seed.major],
    level,
    tierNumber: index + 1,
    minWorkouts: seed.minWorkouts,
    maxWorkouts: next ? next.minWorkouts - 1 : null,
    theme: buildTheme(seed.major, level, sameMajor.length),
  }
})

export function getRankForWorkouts(workoutsCount: number): RankDefinition {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (workoutsCount >= RANKS[i].minWorkouts) return RANKS[i]
  }
  return RANKS[0]
}

export function getNextRank(currentRank: RankDefinition): RankDefinition | null {
  const currentIndex = RANKS.findIndex((r) => r.id === currentRank.id)
  if (currentIndex === -1 || currentIndex === RANKS.length - 1) return null
  return RANKS[currentIndex + 1]
}

export type RankProgress = {
  rank: RankDefinition
  next: RankDefinition | null
  workouts: number
  /** 0–1 dentro do rank atual (1 no rank máximo). */
  ratio: number
  /** Treinos que faltam para o próximo rank (0 no rank máximo). */
  remaining: number
}

export function getRankProgress(workouts: number, override?: RankDefinition | null): RankProgress {
  const rank = override ?? getRankForWorkouts(workouts)
  const next = getNextRank(rank)
  if (!next) return { rank, next, workouts, ratio: 1, remaining: 0 }
  const span = next.minWorkouts - rank.minWorkouts
  const done = Math.min(Math.max(workouts - rank.minWorkouts, 0), span)
  return { rank, next, workouts, ratio: done / span, remaining: span - done }
}
