import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * The single page-title treatment used across the dashboard.
 *
 * Every page previously rolled its own heading with slightly different sizes,
 * weights and spacing. One component means one answer.
 */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string
  description?: ReactNode
  actions?: ReactNode
  className?: string
}) {
  return (
    <header
      className={cn(
        "mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="min-w-0 space-y-1.5">
        <h1 className="h1">{title}</h1>
        {description ? <p className="lede max-w-2xl">{description}</p> : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  )
}

/**
 * Section heading inside a page. Renders a real <h2> so the document outline
 * stays meaningful for screen readers.
 */
export function SectionHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string
  description?: ReactNode
  actions?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("mb-4 flex items-end justify-between gap-4", className)}>
      <div className="min-w-0 space-y-1">
        <h2 className="h2">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  )
}
