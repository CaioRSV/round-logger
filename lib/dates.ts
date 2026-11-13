export function dateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number)
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1)
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  next.setDate(next.getDate() + amount)
  return next
}

export function startOfWeek(date: Date): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const mondayOffset = (start.getDay() + 6) % 7
  start.setDate(start.getDate() - mondayOffset)
  return start
}

export function monthGrid(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const mondayOffset = (first.getDay() + 6) % 7
  const start = addDays(first, -mondayOffset)
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0)
  const totalDaysNeeded = mondayOffset + last.getDate()
  const length = totalDaysNeeded > 35 ? 42 : 35
  return Array.from({ length }, (_, index) => addDays(start, index))
}

export function isSameMonth(date: Date, month: Date): boolean {
  return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth()
}

export function formatMonth(month: Date): string {
  return month.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
}

export function formatMonthName(month: Date): string {
  return month.toLocaleDateString("pt-BR", { month: "long" })
}

export function formatLongDate(key: string): string {
  return parseDateKey(key).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function formatSelectedLabel(key: string): string {
  return parseDateKey(key).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
}

export function formatWeekday(key: string): string {
  return parseDateKey(key).toLocaleDateString("pt-BR", { weekday: "long" })
}

export function formatShortDate(key: string): string {
  return parseDateKey(key).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })
}

export function formatNextDate(key: string): string {
  return parseDateKey(key).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })
}

export function formatChipDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}

export function formatWelcomeDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })
}
