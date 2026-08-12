import type { ComponentType, ReactNode } from "react"
import Link from "next/link"
import { Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Shared frame for the pages a visitor lands on when a link doesn't resolve:
 * not found, expired, paused, 404.
 *
 * These are the only Cuttly pages many visitors will ever see, so they explain
 * what happened in plain language and offer a way forward rather than just
 * stating a status code.
 */
export function StatusPage({
  icon: Icon,
  code,
  title,
  description,
  primaryAction,
  children,
}: {
  icon?: ComponentType<{ className?: string }>
  code?: string
  title: string
  description: ReactNode
  primaryAction?: { label: string; href: string }
  children?: ReactNode
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-md text-center">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2.5 text-sm font-semibold"
        >
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Link2 className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
          </span>
          Cuttly
        </Link>

        <div className="rounded-lg border border-border bg-card p-8">
          {Icon ? (
            <div
              aria-hidden="true"
              className="mx-auto mb-5 flex size-10 items-center justify-center rounded-lg border border-border bg-subtle text-muted-foreground"
            >
              <Icon className="size-4" />
            </div>
          ) : null}

          {code ? (
            <p className="mb-2 font-mono text-xs text-muted-foreground">{code}</p>
          ) : null}

          <h1 className="text-xl font-semibold tracking-[-0.02em]">{title}</h1>
          <p className="mx-auto mt-2.5 max-w-sm text-sm leading-6 text-muted-foreground">
            {description}
          </p>

          {primaryAction ? (
            <Button asChild className="mt-7 w-full">
              <Link href={primaryAction.href}>{primaryAction.label}</Link>
            </Button>
          ) : null}

          {children}
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Want your own short links?{" "}
          <Link href="/" className="underline underline-offset-4 hover:text-foreground">
            Try Cuttly free
          </Link>
        </p>
      </div>
    </main>
  )
}
