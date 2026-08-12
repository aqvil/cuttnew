'use client'

import { useState, useTransition } from "react"
import Link from "next/link"
import { AlertCircle, ArrowRight, Check, Loader2 } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/app/copy-button"
import { createAnonymousLink } from "@/app/actions/links"
import { appOrigin } from "@/lib/app-url"

/**
 * Try-it-now shortener on the marketing page.
 *
 * Creates a real, working link without an account — the point is that the
 * product does what it says before you sign up. The action behind it is
 * rate limited per IP, and the result invites (rather than requires) sign-up
 * to manage the link.
 */
export function HeroShortenForm() {
  const [url, setUrl] = useState("")
  const [shortUrl, setShortUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!url.trim()) {
      setError("Paste a URL to shorten.")
      return
    }

    startTransition(async () => {
      const result = await createAnonymousLink(url)

      if (!result.ok) {
        setError(result.error)
        return
      }

      setShortUrl(`${appOrigin()}/l/${result.data.shortCode}`)
      setUrl("")
    })
  }

  if (shortUrl) {
    return (
      <div className="animate-rise w-full max-w-xl space-y-3">
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center">
          <span
            aria-hidden="true"
            className="hidden size-8 shrink-0 items-center justify-center rounded-full bg-success/10 text-success sm:flex"
          >
            <Check className="size-4" />
          </span>
          <a
            href={shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 flex-1 truncate font-mono text-sm font-medium text-brand hover:underline"
          >
            {shortUrl.replace(/^https?:\/\//, "")}
          </a>
          <div className="flex shrink-0 gap-2">
            <CopyButton value={shortUrl} successMessage="Short link copied" />
            <Button
              variant="ghost"
              onClick={() => {
                setShortUrl(null)
                setUrl("")
              }}
            >
              New
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          This link works right now.{" "}
          <Link href="/auth/sign-up" className="link-brand font-medium">
            Create a free account
          </Link>{" "}
          to track its clicks, edit the destination, or add a QR code.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-xl space-y-2">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row" noValidate>
        <label htmlFor="hero-url" className="sr-only">
          URL to shorten
        </label>
        <Input
          id="hero-url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="Paste a long URL"
          inputMode="url"
          autoComplete="url"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "hero-url-error" : undefined}
          className="h-12 flex-1 text-base sm:text-sm"
        />
        <Button type="submit" size="lg" className="h-12 shrink-0" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Shortening…
            </>
          ) : (
            <>
              Shorten
              <ArrowRight className="size-4" aria-hidden="true" />
            </>
          )}
        </Button>
      </form>

      {error ? (
        <p
          id="hero-url-error"
          role="alert"
          className="flex items-start justify-center gap-1.5 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  )
}
