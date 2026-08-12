'use client'

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { AlertCircle, ArrowRight, Link2, Loader2, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { unlockShortLink } from "@/app/actions/unlock"

/**
 * Password gate for a protected link.
 *
 * The destination is only ever revealed by the server action, and only after
 * the password verifies — nothing about the target is present in the page
 * source beforehand.
 */
export default function UnlockLinkPage() {
  const params = useParams()
  const code = String(params.code ?? "")

  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const result = await unlockShortLink(code, password)

    if (!result.ok) {
      setError(result.error)
      setIsLoading(false)
      setPassword("")
      return
    }

    // `replace` so the back button doesn't return to this gate.
    window.location.replace(result.url)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-10 flex items-center justify-center gap-2.5 text-sm font-semibold"
        >
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Link2 className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
          </span>
          Cuttly
        </Link>

        <div className="rounded-lg border border-border bg-card p-8">
          <div className="mb-7 text-center">
            <div
              aria-hidden="true"
              className="mx-auto mb-4 flex size-10 items-center justify-center rounded-lg border border-border bg-subtle text-muted-foreground"
            >
              <Lock className="size-4" />
            </div>
            <h1 className="text-lg font-semibold tracking-[-0.01em]">
              This link is protected
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Enter the password you were given to continue to the destination.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="link-password">Password</Label>
              <Input
                id="link-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="off"
                autoFocus
                required
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "unlock-error" : undefined}
                className="h-11"
              />
            </div>

            {error ? (
              <p
                id="unlock-error"
                role="alert"
                className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {error}
              </p>
            ) : null}

            <Button type="submit" className="w-full" size="lg" disabled={isLoading || !password}>
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Checking…
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="size-4" aria-hidden="true" />
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Protected links are served by{" "}
          <Link href="/" className="underline underline-offset-4 hover:text-foreground">
            Cuttly
          </Link>
        </p>
      </div>
    </main>
  )
}
