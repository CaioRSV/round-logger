"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Dumbbell,
  Flame,
  FolderOpen,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Swords,
  X,
} from "lucide-react"

import { SessionCard } from "@/components/session-card"
import { SessionEditor } from "@/components/session-editor"
import { ShareDialog } from "@/components/share-dialog"
import {
  dateKey,
  formatChipDate,
  formatMonth,
  formatMonthName,
  formatNextDate,
  formatSelectedLabel,
  formatWeekday,
  formatWelcomeDate,
  isSameMonth,
  monthGrid,
  parseDateKey,
} from "@/lib/dates"
import { loadSessions, saveSessions } from "@/lib/storage"
import {
  activityOn,
  getStatus,
  nextPlannedSession,
  seed,
  sessionsThisWeek,
  trainingDaysInMonth,
  trainingStreak,
} from "@/lib/sessions"
import type { Session, SessionStatus } from "@/lib/types"

const navItems = [
  { label: "Visão geral", icon: Activity },
  { label: "Treinos", icon: FolderOpen },
] as const

const weekDays = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"]

const filters: { id: "all" | SessionStatus; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "complete", label: "Concluídos" },
  { id: "partial", label: "Parciais" },
  { id: "planned", label: "Planejados" },
]

type Dialog =
  | { type: "create"; date: string }
  | { type: "edit"; session: Session }
  | { type: "share"; session: Session }
  | { type: "delete"; session: Session }
  | null

function matchesQuery(session: Session, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  const techLabels = session.exercises.flatMap((exercise) =>
    exercise.type === "pad-work" ? exercise.combinations.flatMap((c) => c.techniques.map((t) => t.label)) : [],
  )
  const haystack = [
    session.title,
    session.kind,
    session.notes ?? "",
    ...session.exercises.flatMap((exercise) => [exercise.name, exercise.notes ?? ""]),
    ...techLabels,
  ]
    .join(" ")
    .toLowerCase()
  return haystack.includes(needle)
}

export function RoundLogger() {
  const today = useMemo(() => new Date(), [])
  const todayKey = dateKey(today)
  const [sessions, setSessions] = useState<Session[]>(seed)
  const [hydrated, setHydrated] = useState(false)
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [selected, setSelected] = useState(todayKey)
  const [view, setView] = useState<(typeof navItems)[number]["label"]>("Visão geral")
  const [dialog, setDialog] = useState<Dialog>(null)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all")

  useEffect(() => {
    setSessions(loadSessions())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) saveSessions(sessions)
  }, [hydrated, sessions])

  useEffect(() => {
    if (!dialog) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDialog(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [dialog])

  const days = useMemo(() => monthGrid(month), [month])
  const selectedSessions = sessions.filter((session) => session.date === selected)
  const visibleSessions = [...sessions]
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title))
    .filter((session) => (filter === "all" || getStatus(session) === filter) && matchesQuery(session, search))
  const completed = sessions.filter((session) => getStatus(session) !== "planned").length
  const weekSessions = sessionsThisWeek(sessions, today)
  const streak = trainingStreak(sessions, today)
  const monthDays = trainingDaysInMonth(sessions, month)
  const upcoming = nextPlannedSession(sessions, todayKey)

  function selectDay(date: Date) {
    setSelected(dateKey(date))
    if (!isSameMonth(date, month)) setMonth(new Date(date.getFullYear(), date.getMonth(), 1))
  }

  function goToToday() {
    setSelected(todayKey)
    setMonth(new Date(today.getFullYear(), today.getMonth(), 1))
  }

  function openCreate(date = selected) {
    setSelected(date)
    setDialog({ type: "create", date })
  }

  function saveSession(session: Session) {
    setSessions((current) => {
      const exists = current.some((item) => item.id === session.id)
      return exists ? current.map((item) => (item.id === session.id ? session : item)) : [session, ...current]
    })
    setSelected(session.date)
    const nextMonth = new Date(`${session.date}T12:00:00`)
    setMonth(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1))
    setView("Visão geral")
    setDialog(null)
  }

  function toggleExercise(sessionId: string, exerciseId: string) {
    setSessions((current) =>
      current.map((session) => {
        if (session.id !== sessionId) return session
        return {
          ...session,
          exercises: session.exercises.map((exercise) => (exercise.id === exerciseId ? { ...exercise, done: !exercise.done } : exercise)),
        }
      }),
    )
  }

  function deleteSession(id: string) {
    setSessions((current) => current.filter((session) => session.id !== id))
    setDialog(null)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Swords size={19} />
          </div>
          <span>
            round<span className="brand-light">logger</span>
          </span>
        </div>
        <div className="side-label">TREINO</div>
        <nav className="side-nav">
          {navItems.map((item) => (
            <button key={item.label} type="button" onClick={() => setView(item.label)} className={`nav-item ${view === item.label ? "active" : ""}`}>
              <item.icon size={17} />
              {item.label}
              {item.label === "Treinos" && <span className="nav-count">{sessions.length}</span>}
            </button>
          ))}
        </nav>
        <div className="side-label workspace-label">BIBLIOTECA</div>
        <button className="nav-item" type="button" onClick={() => setView("Treinos")}>
          <Dumbbell size={17} />
          Exercícios
        </button>
        <div className="sidebar-bottom">
          <div className="weekly-card">
            <div className="weekly-top">
              <span>ESTA SEMANA</span>
              <ArrowUpRight size={14} />
            </div>
            <div className="weekly-number">
              {weekSessions}
              <span> / 5 treinos</span>
            </div>
            <div className="week-bars">
              {weekDays.map((day, index) => (
                <i key={day} className={index < Math.min(weekSessions, 7) ? "filled" : ""} />
              ))}
            </div>
            <div className="week-days">
              {weekDays.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
          </div>
          <button className="profile" type="button">
            <div className="avatar">C</div>
            <div>
              <b>Meu espaço</b>
              <small>Log pessoal</small>
            </div>
            <MoreHorizontal size={18} />
          </button>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Round Logger</span>
            <ChevronRight size={14} />
            <b>{view}</b>
          </div>
          <div className="top-actions">
            <span className="today-chip" suppressHydrationWarning>
              <span className="live-dot" /> {formatChipDate(today)}
            </span>
            <button className="icon-btn" type="button" aria-label="Pesquisar" onClick={() => setView("Treinos")}>
              <Search size={17} />
            </button>
            <button className="top-create" type="button" onClick={() => openCreate()}>
              <Plus size={16} /> Novo treino
            </button>
          </div>
        </header>
        {view === "Visão geral" ? (
          <section className="content">
            <div className="welcome-row">
              <div>
                <div className="eyebrow">
                  <span className="eyebrow-line" /> SEU CAMINHO, SEU RITMO
                </div>
                <h1>Treine com intenção.</h1>
                <p className="welcome-sub">Consistência se constrói round a round.</p>
              </div>
              <button className="date-picker" type="button" onClick={goToToday} suppressHydrationWarning>
                <CalendarDays size={16} />
                {formatWelcomeDate(today)}
                <ChevronDown size={14} />
              </button>
            </div>
            <section className="fight-quest" aria-label="Desafio da semana">
              <div className="quest-copy">
                <div className="quest-eyebrow">
                  <span className="quest-live" /> DESAFIO DA SEMANA <span className="quest-separator">/</span> RANK NOVATO II
                </div>
                <h2>
                  Mais um round.
                  <br />
                  <span>Mais perto do próximo nível.</span>
                </h2>
                <p>Seu ritmo está ficando forte. Complete a meta e desbloqueie o próximo marco.</p>
                <div className="quest-progress">
                  <div className="quest-progress-track">
                    <span style={{ width: `${Math.min((weekSessions / 5) * 100, 100)}%` }} />
                  </div>
                  <b>
                    {weekSessions}
                    <span> / 5 treinos</span>
                  </b>
                  <span className="quest-xp">+250 XP</span>
                </div>
              </div>
              <div className="quest-stamp">
                <Flame size={13} /> META ATIVA
              </div>
            </section>
            <div className="stats-grid">
              <Stat icon={Swords} label="TREINOS REGISTRADOS" value={String(completed).padStart(2, "0")} foot="no seu histórico" />
              <Stat icon={Activity} label="ESTA SEMANA" value={String(weekSessions).padStart(2, "0")} foot="sessões concluídas" />
              <Stat icon={Flame} label="SEQUÊNCIA ATUAL" value={String(streak).padStart(2, "0")} foot="dias treinando" accent />
              <Stat icon={CalendarDays} label="DIAS DE TREINO" value={String(monthDays).padStart(2, "0")} foot={`em ${formatMonthName(month)}`} />
            </div>
            <div className="dashboard-grid">
              <section className="panel calendar-panel">
                <div className="panel-heading">
                  <div>
                    <div className="section-kicker">ATIVIDADE</div>
                    <h2>Seu calendário</h2>
                  </div>
                  <div className="calendar-nav">
                    <button type="button" aria-label="Mês anterior" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
                      <ChevronLeft size={16} />
                    </button>
                    <span>{formatMonth(month)}</span>
                    <button type="button" aria-label="Próximo mês" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
                <div className="calendar">
                  <div className="calendar-weekdays">
                    {weekDays.map((day) => (
                      <span key={day}>{day}</span>
                    ))}
                  </div>
                  <div className="calendar-days">
                    {days.map((day) => {
                      const key = dateKey(day)
                      const count = activityOn(sessions, key)
                      const hasPlanned = sessions.some((s) => s.date === key && getStatus(s) === "planned")
                      return (
                        <button
                          key={key}
                          type="button"
                          aria-label={`${day.toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}${count ? `, ${count} treino(s) feito(s)` : hasPlanned ? ", treino planejado" : ", sem treino"}`}
                          aria-pressed={selected === key}
                          onClick={() => selectDay(day)}
                          className={`day-cell ${isSameMonth(day, month) ? "" : "outside"} ${selected === key ? "selected" : ""} ${key === todayKey ? "is-today" : ""}`}
                        >
                          <span>{day.getDate()}</span>
                          {count > 0 ? (
                            <i className={`activity-dot intensity-${Math.min(count, 3)}`} />
                          ) : hasPlanned ? (
                            <i className="activity-dot planned-dot" title="Treino planejado" />
                          ) : null}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="calendar-legend">
                  <span>MENOS</span>
                  {[0, 1, 2, 3].map((level) => (
                    <i key={level} className={level ? `intensity-${level}` : "empty"} />
                  ))}
                  <span>MAIS</span>
                  <span className="legend-note">Só o que foi feito entra na marca</span>
                </div>
              </section>
              <section className="panel day-panel">
                <div className="day-heading">
                  <div>
                    <div className="section-kicker">DIA SELECIONADO</div>
                    <h2>{selected === todayKey ? "Hoje" : formatWeekday(selected)}</h2>
                    <p>{formatSelectedLabel(selected)}</p>
                  </div>
                  <button className="add-square" type="button" aria-label="Adicionar treino" onClick={() => openCreate(selected)}>
                    <Plus size={17} />
                  </button>
                </div>
                <div className="day-divider" />
                <div className="session-list">
                  {selectedSessions.length ? (
                    selectedSessions.map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        onToggle={toggleExercise}
                        onShare={(item) => setDialog({ type: "share", session: item })}
                        onEdit={(item) => setDialog({ type: "edit", session: item })}
                        onDelete={(item) => setDialog({ type: "delete", session: item })}
                      />
                    ))
                  ) : (
                    <div className="empty-day">
                      <div className="empty-icon">
                        <CalendarDays size={19} />
                      </div>
                      <b>Nenhum treino por aqui</b>
                      <span>Um round de cada vez. Comece quando quiser.</span>
                      <button type="button" onClick={() => openCreate(selected)}>
                        <Plus size={15} /> Adicionar treino
                      </button>
                    </div>
                  )}
                </div>
                <div className="day-footer">
                  <span>
                    {selectedSessions.length} {selectedSessions.length === 1 ? "SESSÃO" : "SESSÕES"}
                  </span>
                  <button type="button" onClick={() => setView("Treinos")}>
                    Ver histórico <ArrowRight size={14} />
                  </button>
                </div>
              </section>
            </div>
            <div className="bottom-row">
              <div className="training-note">
                <div className="note-icon">
                  <Sparkles size={17} />
                </div>
                <div>
                  <b>O progresso mora na repetição.</b>
                  <span>Registre cada sessão. Seu futuro eu vai agradecer.</span>
                </div>
                <span className="note-tag">ROUND 01</span>
              </div>
              <button
                type="button"
                className="bottom-date clickable"
                onClick={() => {
                  if (upcoming) {
                    setSelected(upcoming.date)
                    const d = parseDateKey(upcoming.date)
                    setMonth(new Date(d.getFullYear(), d.getMonth(), 1))
                  } else {
                    openCreate(todayKey)
                  }
                }}
              >
                <Clock3 size={14} />
                <span>PRÓXIMO TREINO</span>
                <b>{upcoming ? formatNextDate(upcoming.date) : "Planeje seu próximo round"}</b>
                <ArrowRight size={15} />
              </button>
            </div>
          </section>
        ) : (
          <section className="content sessions-content">
            <div className="welcome-row">
              <div>
                <div className="eyebrow">
                  <span className="eyebrow-line" /> SEU HISTÓRICO
                </div>
                <h1>Treinos</h1>
                <p className="welcome-sub">Cada sessão conta. Acompanhe sua jornada.</p>
              </div>
              <button className="top-create" type="button" onClick={() => openCreate()}>
                <Plus size={16} /> Novo treino
              </button>
            </div>
            <div className="list-toolbar">
              <div className="search-box">
                <Search size={16} />
                <input placeholder="Buscar sessões..." value={search} onChange={(event) => setSearch(event.target.value)} />
              </div>
              <div className="filter-group">
                {filters.map((item) => (
                  <button key={item.id} type="button" onClick={() => setFilter(item.id)} className={filter === item.id ? "chosen" : ""}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="history-list">
              {visibleSessions.length ? (
                visibleSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onToggle={toggleExercise}
                    onShare={(item) => setDialog({ type: "share", session: item })}
                    onEdit={(item) => setDialog({ type: "edit", session: item })}
                    onDelete={(item) => setDialog({ type: "delete", session: item })}
                  />
                ))
              ) : (
                <div className="empty-day history-empty">
                  <div className="empty-icon">
                    <FolderOpen size={19} />
                  </div>
                  <b>Nenhuma sessão encontrada</b>
                  <span>Ajuste a busca ou registre um treino novo.</span>
                  {search || filter !== "all" ? (
                    <button type="button" onClick={() => { setSearch(""); setFilter("all"); }}>
                      Limpar busca e filtros
                    </button>
                  ) : (
                    <button type="button" onClick={() => openCreate()}>
                      <Plus size={15} /> Adicionar treino
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>
        )}
      </main>
      {dialog?.type === "create" && <SessionEditor date={dialog.date} onClose={() => setDialog(null)} onSave={saveSession} />}
      {dialog?.type === "edit" && <SessionEditor key={dialog.session.id} session={dialog.session} date={dialog.session.date} onClose={() => setDialog(null)} onSave={saveSession} />}
      {dialog?.type === "share" && <ShareDialog session={dialog.session} onClose={() => setDialog(null)} />}
      {dialog?.type === "delete" && (
        <div className="modal-backdrop">
          <section className="modal confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-title">
            <div className="modal-head">
              <div>
                <div className="section-kicker">EXCLUIR SESSÃO</div>
                <h2 id="delete-title">Apagar este treino?</h2>
              </div>
              <button className="icon-btn" type="button" onClick={() => setDialog(null)} aria-label="Fechar">
                <X size={18} />
              </button>
            </div>
            <p className="confirm-copy">
              <b>{dialog.session.title}</b> sai do calendário e do histórico neste navegador. Essa ação não pode ser desfeita.
            </p>
            <div className="modal-actions">
              <button className="cancel-btn" type="button" onClick={() => setDialog(null)}>
                Cancelar
              </button>
              <button className="top-create" type="button" onClick={() => deleteSession(dialog.session.id)}>
                Excluir treino
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
  foot,
  accent = false,
}: {
  icon: typeof Swords
  label: string
  value: string
  foot: string
  accent?: boolean
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <Icon size={16} className={accent ? "stat-accent" : ""} />
      </div>
      <div className={`stat-value ${accent ? "accent-value" : ""}`}>
        {value}
        <span className="stat-foot">{foot}</span>
      </div>
      <div className="stat-bottom">
        <span className={accent ? "stat-dot" : ""} />
        <span>{accent ? "Ritmo constante" : "Atualizado agora"}</span>
      </div>
    </div>
  )
}
