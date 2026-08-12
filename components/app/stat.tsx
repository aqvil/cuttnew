import type { ReactNode } from "react"
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * A headline metric.
 *
 * Trend is conveyed by an arrow *and* a sign as well as colour, so it still
 * reads correctly without colour perception. Values use tabular figures so a
 * row of stats doesn't shift as numbers update.
 */
export function Stat({
  label,
  value,
  hint,
  trend,
  className,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  /** Percentage change vs. the preceding period. Omit when there's no baseline. */
  trend?: { changePercent: number; label: string } | null
  className?: string
}) {
  return (
    <div className={cn("min-w-0 space-y-1.5", className)}>
      <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
      <p className="text-[28px] font-semibold leading-none tracking-[-0.02em] tabular">
        {value}
      </p>
      {trend ? <TrendPill {...trend} /> : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

function TrendPill({ changePercent, label }: { changePercent: number; label: string }) {
  const isFlat = Math.abs(changePercent) < 0.5
  const isUp = changePercent > 0

  const Icon = isFlat ? ArrowRight : isUp ? ArrowUpRight : ArrowDownRight
  const tone = isFlat
    ? "text-muted-foreground"
    : isUp
      ? "text-success"
      : "text-destructive"

  const formatted = isFlat
    ? "No change"
    : `${isUp ? "+" : ""}${changePercent.toFixed(0)}%`

  return (
    <p className={cn("flex items-center gap-1 text-xs font-medium", tone)}>
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      <span>{formatted}</span>
      <span className="font-normal text-muted-foreground">{label}</span>
    </p>
  )
}

/**
 * Row of stats separated by hairlines rather than wrapped in individual cards —
 * fewer boxes, clearer hierarchy.
 */
export function StatRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-6 gap-y-8 rounded-lg border border-border bg-card p-6",
        "lg:grid-cols-4 lg:gap-x-0 lg:divide-x lg:divide-border",
        "[&>*]:lg:px-6 [&>*:first-child]:lg:pl-0 [&>*:last-child]:lg:pr-0",
        className
      )}
    >
      {children}
    </div>
  )
}

/** Percentage change between two periods, or null when there's no baseline. */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null
  return ((current - previous) / previous) * 100
}
