import { ChevronDown, ChevronUp } from "lucide-react"
import type { CSSProperties } from "react"

import { RANKS, toRoman, type RankProgress, type RankTheme } from "@/lib/ranks"

type RankQuestProps = {
  progress: RankProgress
  collapsed: boolean
  onToggle: () => void
}

function themeVars(theme: RankTheme): CSSProperties {
  return {
    "--rk-bg": theme.cardBg,
    "--rk-border": theme.cardBorder,
    "--rk-glow": theme.boxGlow,
    "--rk-dots": theme.dotPattern,
    "--rk-eyebrow": theme.eyebrowText,
    "--rk-dot": theme.liveDotColor,
    "--rk-dot-shadow": theme.liveDotShadow,
    "--rk-sep": theme.separatorColor,
    "--rk-heading": theme.headingText,
    "--rk-accent": theme.headingAccent,
    "--rk-text": theme.textColor,
    "--rk-track": theme.progressTrackBg,
    "--rk-fill": theme.progressFill,
    "--rk-fill-glow": theme.progressGlow,
    "--rk-stamp": theme.stampText,
    "--rk-stamp-bg": theme.stampBg,
    "--rk-stamp-border": theme.stampBorder,
    "--rk-badge-bg": theme.badgeBg,
    "--rk-badge-border": theme.badgeBorder,
    "--rk-badge-text": theme.badgeText,
  } as CSSProperties
}

export function RankQuest({ progress, collapsed, onToggle }: RankQuestProps) {
  const { rank, next, ratio, remaining, workouts } = progress
  const levels = RANKS.filter((item) => item.major === rank.major)
  const className = `rank-themed rank-${rank.major}`
  const style = themeVars(rank.theme)
  const nextLabel = next ? (
    <>
      {remaining} {remaining === 1 ? "treino" : "treinos"}
      <span> para {next.name}</span>
    </>
  ) : (
    <>
      Rank máximo<span> alcançado</span>
    </>
  )

  if (collapsed) {
    return (
      <section className={`${className} rank-collapsed`} style={style} aria-label={`Rank ${rank.name} (recolhido)`}>
        <div className="rank-collapsed-info">
          <span className="quest-eyebrow">
            <span className="quest-live" /> SEU RANK <span className="quest-separator">/</span>
          </span>
          <b className="rank-name rank-name-sm">{rank.name}</b>
          <div className="quest-progress-track" style={{ width: "90px" }}>
            <span style={{ width: `${ratio * 100}%` }} />
          </div>
          <span className="rank-collapsed-count">{nextLabel}</span>
        </div>
        <button type="button" className="rank-toggle" onClick={onToggle}>
          <ChevronDown size={13} /> Expandir
        </button>
      </section>
    )
  }

  return (
    <section className={`fight-quest ${className}`} style={{ ...style, marginTop: "20px" }} aria-label={`Rank ${rank.name}`}>
      <div className="quest-copy">
        <div className="quest-eyebrow">
          <span className="quest-live" /> SEU RANK <span className="quest-separator">/</span> {rank.majorName.toUpperCase()}
        </div>
        <h2 className="rank-name">{rank.name}</h2>
        <div className="rank-levels" aria-label={`Nível ${rank.level} de ${levels.length}`}>
          {levels.map((item) => (
            <span key={item.id} className={item.level <= rank.level ? "reached" : ""}>
              {toRoman(item.level)}
            </span>
          ))}
        </div>
        <div className="quest-progress">
          <div className="quest-progress-track">
            <span style={{ width: `${ratio * 100}%` }} />
          </div>
          <b>{nextLabel}</b>
        </div>
        <p className="rank-total">
          {workouts} {workouts === 1 ? "treino registrado" : "treinos registrados"}
        </p>
      </div>
      <div className="rank-corner">
        <span className="rank-badge">
          RANK {rank.tierNumber}/{RANKS.length}
        </span>
        <button type="button" className="rank-toggle" onClick={onToggle} title="Recolher rank">
          <ChevronUp size={13} /> Recolher
        </button>
      </div>
    </section>
  )
}
