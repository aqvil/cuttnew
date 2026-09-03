import type { ReactNode } from "react"
import type { Breakdown } from "@/lib/analytics/types"
import { countryFlag, countryName } from "@/lib/format"

/**
 * A ranked breakdown (countries, referrers, devices…).
 *
 * Rendered as a labelled bar rather than a pie: comparing lengths along a
 * shared baseline is far more accurate than comparing angles, and it degrades
 * gracefully to a plain list on narrow screens.
 */
export function BreakdownList({
  items,
  emptyMessage = "No data in this period.",
  formatLabel,
  max = 6,
}: {
  items: Breakdown[]
  emptyMessage?: string
  formatLabel?: (label: string) => ReactNode
  max?: number
}) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-[12px] text-muted-foreground">{emptyMessage}</p>
    )
  }

  const visible = items.slice(0, max)
  const total = items.reduce((sum, item) => sum + item.value, 0)
  const largest = Math.max(...visible.map((item) => item.value), 1)

  return (
    <ul className="space-y-2.5">
      {visible.map((item) => {
        const share = total > 0 ? (item.value / total) * 100 : 0
        return (
          <li key={item.label} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3 text-[12px]">
              <span className="min-w-0 truncate">
                {formatLabel ? formatLabel(item.label) : item.label}
              </span>
              <span className="shrink-0 text-muted-foreground tabular">
                {item.value.toLocaleString()}
                <span className="ml-1.5 text-xs">({share.toFixed(0)}%)</span>
              </span>
            </div>
            <div
              className="h-1 overflow-hidden rounded-none bg-muted"
              role="img"
              aria-label={`${item.label}: ${item.value} of ${total}, ${share.toFixed(0)} percent`}
            >
              <div
                className="h-full bg-chart-1"
                style={{ width: `${(item.value / largest) * 100}%` }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

/** Country labels get a flag and the full name rather than a bare ISO code. */
export function countryLabel(code: string): ReactNode {
  if (code === "Unknown") {
    return <span className="text-muted-foreground">Unknown</span>
  }
  return (
    <span className="flex items-center gap-2">
      <span aria-hidden="true">{countryFlag(code)}</span>
      {countryName(code)}
    </span>
  )
}
