/**
 * Display formatting shared by server and client components.
 * No "server-only" — these run in both.
 */

/** 1,204 → "1,204"; 12,400 → "12.4K"; 1,240,000 → "1.24M" */
export function compactNumber(value: number): string {
  if (!Number.isFinite(value)) return "0"
  if (Math.abs(value) < 10_000) return value.toLocaleString()
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(
    value
  )
}

export function fullNumber(value: number | null | undefined): string {
  return (value ?? 0).toLocaleString()
}

/** "12 Mar 2026" — unambiguous across locales, unlike a numeric date. */
export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—"
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "—"
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/** "3 minutes ago" / "in 2 days" */
export function formatRelative(value: Date | string | null | undefined): string {
  if (!value) return "—"
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  const deltaSeconds = Math.round((date.getTime() - Date.now()) / 1000)
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

  const thresholds: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["second", 60],
    ["minute", 60],
    ["hour", 24],
    ["day", 7],
    ["week", 4.35],
    ["month", 12],
    ["year", Number.POSITIVE_INFINITY],
  ]

  let value_ = deltaSeconds
  for (const [unit, divisor] of thresholds) {
    if (Math.abs(value_) < divisor) return formatter.format(Math.round(value_), unit)
    value_ /= divisor
  }

  return formatter.format(Math.round(value_), "year")
}

/** Truncates in the middle so both ends of a URL stay readable. */
export function truncateMiddle(value: string, max = 60): string {
  if (value.length <= max) return value
  const half = Math.floor((max - 1) / 2)
  return `${value.slice(0, half)}…${value.slice(-half)}`
}

/** Regional-indicator flag for an ISO-3166 alpha-2 code. */
export function countryFlag(code: string): string {
  if (!/^[A-Za-z]{2}$/.test(code)) return "🏳️"
  return String.fromCodePoint(
    ...code
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0))
  )
}

const COUNTRY_NAMES = new Intl.DisplayNames(["en"], { type: "region" })

export function countryName(code: string): string {
  if (!/^[A-Za-z]{2}$/.test(code)) return code
  try {
    return COUNTRY_NAMES.of(code.toUpperCase()) || code
  } catch {
    return code
  }
}
