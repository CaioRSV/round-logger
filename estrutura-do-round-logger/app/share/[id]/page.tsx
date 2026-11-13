import { notFound } from "next/navigation"
import { Activity, CalendarDays, Clock3, Dumbbell, Shield, Swords, Timer } from "lucide-react"
import { seed } from "@/lib/mock-sessions"

const icons: Record<string, typeof Dumbbell> = { "Pad work": Swords, "Heavy bag": Dumbbell, "Shadowboxing": Shield, "Jump rope": Timer, "Burpees": Activity, "Sparring": Swords }

export default async function SharedSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = seed.find((item) => item.id === id)
  if (!session) notFound()

  return (
    <main className="shared-page">
      <header className="shared-header"><a className="brand" href="/"><span className="brand-mark"><Swords size={19}/></span><span>round<span className="brand-light">logger</span></span></a><span className="shared-label"><Shield size={13}/> PLANO COMPARTILHADO</span></header>
      <article className="shared-card">
        <div className="shared-eyebrow">{session.kind}<span>·</span> SESSÃO DE TREINO</div>
        <h1>{session.title}</h1>
        <div className="shared-date"><CalendarDays size={15}/>{new Date(`${session.date}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
        <div className="shared-plan-banner"><div className="shared-plan-emblem"><Swords size={18}/></div><div><span>O PLANO DO DIA</span><b>Seu próximo round começa aqui.</b></div><strong>{String(session.exercises.length).padStart(2,"0")}<small> ESTAÇÕES</small></strong></div>
        {session.notes && <div className="shared-notes"><span>NOTAS DO TREINO</span><p>{session.notes}</p></div>}
        <div className="shared-exercises-title"><span>SEQUÊNCIA DO TREINO</span><span>{session.exercises.length} ESTAÇÕES</span></div>
        <div className="shared-exercises">{session.exercises.map((exercise, index) => { const Icon = icons[exercise.type] ?? Dumbbell; return <section className="shared-exercise" key={exercise.id}><div className="shared-station-index">{String(index + 1).padStart(2,"0")}</div><div className="exercise-type-icon"><Icon size={16}/></div><div className="shared-exercise-copy"><div className="shared-exercise-heading"><span>{exercise.type.toUpperCase()}</span>{exercise.intensity && <span className="intensity-badge">{exercise.intensity.toUpperCase()}</span>}</div><b>{exercise.name}</b><span className="shared-exercise-detail"><Clock3 size={13}/>{exercise.detail}<span className="shared-round-label">ROUND {String(index+1).padStart(2,"0")}</span></span>{exercise.combinations?.map((combo, comboIndex) => <small key={comboIndex}><span className="combo-marker">COMBO {String(comboIndex+1).padStart(2,"0")}</span>{combo}</small>)}</div><span className="station-ready">PRONTO</span></section> })}</div>
        <footer className="shared-footer"><Shield size={14}/> Este treino foi compartilhado para visualização. <a href="/">Criar seu próprio registro <span>↗</span></a></footer>
      </article>
    </main>
  )
}
