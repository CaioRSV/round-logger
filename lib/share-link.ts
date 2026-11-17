// Links compartilháveis curtos: /s#2<dados>
// Não há servidor, então o treino viaja dentro do link. Para encurtar:
//  1. formato compacto em arrays (sem ids, sem "feito", golpes conhecidos viram o id curto do preset);
//  2. compressão deflate (CompressionStream, nativo do navegador);
//  3. base64url.
// Links antigos (/share/<id>#<base64 do JSON>) continuam abrindo via decodeSharePayload.

import { decodeSharePayload } from "@/lib/storage"
import { parseSession } from "@/lib/sessions"
import { presetIdForLabel, presetLabel } from "@/lib/techniques"
import type { Combination, Exercise, Session, Technique } from "@/lib/types"
import { disciplines, hasCombinations } from "@/lib/types"

const VERSION = "2"
export const SHARE_ROUTE = "/s"

type CompactTechnique = string // "jab" (preset) ou "=Golpe personalizado"
type CompactExtras = {
  o?: string // notas
  i?: string // intensidade (sparring)
  r?: number // descanso (s)
  x?: number // repetir
  c?: CompactTechnique[][] // combinações
}
type CompactExercise = [type: string, name: string, a: number, b: number, extras?: CompactExtras]
type CompactSession = [title: string, date: string, kind: number, exercises: CompactExercise[], notes?: string]

function compactTechnique(technique: Technique): CompactTechnique {
  const presetId = technique.custom ? undefined : presetIdForLabel(technique.label)
  return presetId ?? `=${technique.label}`
}

function expandTechnique(value: CompactTechnique, index: number): Technique {
  if (value.startsWith("=")) return { id: `t${index}`, label: value.slice(1), custom: true }
  return { id: `t${index}`, label: presetLabel(value) }
}

function compactExercise(exercise: Exercise): CompactExercise {
  const extras: CompactExtras = {}
  if (exercise.notes) extras.o = exercise.notes
  if (exercise.restSeconds !== undefined) extras.r = exercise.restSeconds
  if (exercise.repeat !== undefined && exercise.repeat > 1) extras.x = exercise.repeat
  if (exercise.type === "sparring") extras.i = exercise.intensity
  if (hasCombinations(exercise) && exercise.combinations.length > 0) {
    extras.c = exercise.combinations.map((combination) => combination.techniques.map(compactTechnique))
  }
  const [a, b] = exercise.type === "burpees" ? [exercise.sets, exercise.reps] : [exercise.rounds, exercise.durationMinutes]
  const base: CompactExercise = [exercise.type, exercise.name, a, b]
  return Object.keys(extras).length > 0 ? [exercise.type, exercise.name, a, b, extras] : base
}

function toCompact(session: Session): CompactSession {
  const compact: CompactSession = [session.title, session.date, disciplines.indexOf(session.kind), session.exercises.map(compactExercise)]
  if (session.notes) compact.push(session.notes)
  return compact
}

function fromCompact(compact: CompactSession): Session | null {
  const [title, date, kind, exercises, notes] = compact
  let techniqueCounter = 0
  const raw = {
    id: "shared",
    title,
    date,
    kind: disciplines[kind],
    notes,
    exercises: exercises.map(([type, name, a, b, extras = {}], index) => {
      const base = { id: `e${index}`, type, name, done: false, notes: extras.o, restSeconds: extras.r, repeat: extras.x }
      if (type === "burpees") return { ...base, sets: a, reps: b }
      const combinations: Combination[] | undefined = extras.c?.map((techniques, comboIndex) => ({
        id: `c${index}-${comboIndex}`,
        techniques: techniques.map((technique) => expandTechnique(technique, techniqueCounter++)),
      }))
      return {
        ...base,
        rounds: a,
        durationMinutes: b,
        ...(type === "sparring" ? { intensity: extras.i } : {}),
        ...(combinations ? { combinations } : type === "pad-work" || type === "clinch" ? { combinations: [] } : {}),
      }
    }),
  }
  // Mesma validação/normalização usada para dados locais e backups.
  return parseSession(JSON.parse(JSON.stringify(raw)))
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ""
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

function base64UrlToBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/")
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4)
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0))
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const output = new Blob([bytes as BlobPart]).stream().pipeThrough(stream)
  return new Uint8Array(await new Response(output).arrayBuffer())
}

const canCompress = () => typeof CompressionStream !== "undefined" && typeof DecompressionStream !== "undefined"

export async function encodeShareLink(session: Session): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(toCompact(session)))
  // "2" = comprimido; "3" = compacto sem compressão (navegadores sem CompressionStream).
  if (!canCompress()) return `3${bytesToBase64Url(json)}`
  return `${VERSION}${bytesToBase64Url(await pipe(json, new CompressionStream("deflate-raw")))}`
}

export async function decodeShareLink(payload: string): Promise<Session | null> {
  try {
    if (payload.startsWith("2") || payload.startsWith("3")) {
      let bytes = base64UrlToBytes(payload.slice(1))
      if (payload.startsWith("2")) {
        if (!canCompress()) return null
        bytes = await pipe(bytes, new DecompressionStream("deflate-raw"))
      }
      const compact: unknown = JSON.parse(new TextDecoder().decode(bytes))
      return Array.isArray(compact) ? fromCompact(compact as CompactSession) : null
    }
    return decodeSharePayload(payload) // formato antigo
  } catch {
    return null
  }
}

export async function shareUrl(session: Session): Promise<string> {
  return `${window.location.origin}${SHARE_ROUTE}#${await encodeShareLink(session)}`
}
