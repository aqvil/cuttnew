'use client'

import { useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { RANGE_LABELS, type AnalyticsRange } from "@/lib/analytics/types"
import { cn } from "@/lib/utils"

const ORDER: AnalyticsRange[] = ["24h", "7d", "30d", "90d", "12m"]
const SHORT: Record<AnalyticsRange, string> = {
  "24h": "24h",
  "7d": "7d",
  "30d": "30d",
  "90d": "90d",
  "12m": "12m",
}

/**
 * Time-range switcher.
 *
 * Writes to the URL so the server re-queries with the new window — the range
 * genuinely changes the data rather than relabelling the same numbers, which
 * is what the previous static "Jul 10 → Aug 8" control implied but never did.
 */
export function RangeSelector({ value }: { value: AnalyticsRange }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const select = (range: AnalyticsRange) => {
    const params = new URLSearchParams(searchParams.toString())
    if (range === "30d") params.delete("range")
    else params.set("range", range)

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  return (
    <div
      role="group"
      aria-label="Select time range"
      className={cn(
        "inline-flex items-center rounded-md border border-border bg-subtle p-0.5",
        isPending && "opacity-70"
      )}
    >
      {ORDER.map((range) => {
        const active = range === value
        return (
          <button
            key={range}
            type="button"
            onClick={() => select(range)}
            aria-pressed={active}
            title={RANGE_LABELS[range]}
            className={cn(
              "rounded-sm px-2.5 py-1 text-xs font-medium transition-colors",
              active
                ? "bg-card text-foreground shadow-[var(--shadow-subtle)]"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {SHORT[range]}
          </button>
        )
      })}
    </div>
  )
}
