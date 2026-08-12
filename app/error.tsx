'use client'

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, Link2, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Route-level error boundary.
 *
 * Next only exposes a `digest` in production, never the message — so the page
 * shows the digest as a reference code rather than pretending to explain what
 * broke. There was no error boundary before this, so an unhandled render error
 * produced a blank screen.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[app] unhandled error:", error)
  }, [error])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="mb-10 inline-flex items-center gap-2.5 text-sm font-semibold">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Link2 className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
          </span>
          Cuttly
        </Link>

        <div className="rounded-lg border border-border bg-card p-8">
          <div
            aria-hidden="true"
            className="mx-auto mb-5 flex size-10 items-center justify-center rounded-lg border border-border bg-subtle text-muted-foreground"
          >
            <AlertTriangle className="size-4" />
          </div>

          <h1 className="text-xl font-semibold tracking-[-0.02em]">Something went wrong</h1>
          <p className="mx-auto mt-2.5 max-w-sm text-sm leading-6 text-muted-foreground">
            This one&apos;s on us. Trying again often works — if it doesn&apos;t, get in touch
            and quote the reference below.
          </p>

          <div className="mt-7 flex flex-col gap-2 sm:flex-row">
            <Button onClick={reset} className="flex-1">
              <RotateCw className="size-4" aria-hidden="true" />
              Try again
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </div>

          {error.digest ? (
            <p className="mt-6 font-mono text-xs text-muted-foreground">
              Reference: {error.digest}
            </p>
          ) : null}
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          <Link href="/contact" className="underline underline-offset-4 hover:text-foreground">
            Report this problem
          </Link>
        </p>
      </div>
    </main>
  )
}
