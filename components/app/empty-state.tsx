import type { ComponentType, ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * Empty states explain what's missing and offer the next action, instead of
 * showing an empty table.
 *
 * `variant="filtered"` is for "your filters matched nothing", which is a
 * different situation from "you haven't created anything yet" and needs a
 * different escape hatch.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  variant = "empty",
  className,
}: {
  icon?: ComponentType<{ className?: string }>
  title: string
  description?: ReactNode
  action?: ReactNode
  secondaryAction?: ReactNode
  variant?: "empty" | "filtered"
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-16 text-center",
        variant === "filtered" && "py-12",
        className
      )}
    >
      {Icon ? (
        <div
          aria-hidden="true"
          className="mb-4 flex size-10 items-center justify-center rounded-lg border border-border bg-subtle text-muted-foreground"
        >
          <Icon className="size-4" />
        </div>
      ) : null}

      <h3 className="text-sm font-semibold text-foreground">{title}</h3>

      {description ? (
        <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      ) : null}

      {action || secondaryAction ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  )
}
