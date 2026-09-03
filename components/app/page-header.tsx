import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * The single page-title treatment used across the dashboard.
 *
 * Every page previously rolled its own heading with slightly different sizes,
 * weights and spacing. One component means one answer.
 *
 * The optional `eyebrow` is the technical register's locator — a short
 * uppercase string naming the section the page belongs to — and the header
 * closes with a hairline so the title band reads as a plate above the
 * content rather than as floating text.
 */
export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  className,
}: {
  title: string
  description?: ReactNode
  actions?: ReactNode
  eyebrow?: string
  className?: string
}) {
  return (
    <header
      className={cn(
        "mb-7 flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="min-w-0 space-y-2">
        {eyebrow ? (
          <p className="mono-label flex items-center gap-2">
            <span aria-hidden="true" className="inline-block h-px w-4 bg-border" />
            {eyebrow}
          </p>
        ) : null}
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
          <p className="text-[13px] text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  )
}
