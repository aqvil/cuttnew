'use client'

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowRight, Check, Loader2, Settings2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CopyButton } from "@/components/app/copy-button"
import { createLink } from "@/app/actions/links"

/**
 * One-field link creation on the dashboard.
 *
 * The fastest possible path to the product's core value: paste, press, copy.
 * Anything beyond that lives on the full create page, one click away.
 */
export function QuickCreate({ appOrigin }: { appOrigin: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [url, setUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ id: string; shortCode: string } | null>(null)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!url.trim()) {
      setError("Paste a URL to shorten.")
      return
    }

    startTransition(async () => {
      const response = await createLink({ originalUrl: url })

      if (!response.ok) {
        setError(response.error)
        toast.error(response.error)
        return
      }

      setResult({ id: response.data.id, shortCode: response.data.shortCode })
      setUrl("")
      toast.success("Short link created.")
      router.refresh()
    })
  }

  if (result) {
    const fullUrl = `${appOrigin}/l/${result.shortCode}`
    return (
      <section className="animate-rise rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Check className="size-4 text-success" aria-hidden="true" />
          Your link is ready
        </div>

        <div className="mt-3 flex flex-col gap-2 rounded-lg border border-border bg-subtle p-3 sm:flex-row sm:items-center">
          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 flex-1 truncate font-mono text-sm font-medium text-brand hover:underline"
          >
            {fullUrl.replace(/^https?:\/\//, "")}
          </a>
          <CopyButton value={fullUrl} successMessage="Short link copied" className="shrink-0" />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setResult(null)}>
            Shorten another
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/dashboard/links/${result.id}`}>
              Open link details
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <form onSubmit={handleSubmit} noValidate>
        <Label htmlFor="quick-url" className="text-sm font-semibold">
          Shorten a link
        </Label>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Input
            id="quick-url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com/a-very-long-url"
            inputMode="url"
            autoComplete="url"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "quick-url-error" : undefined}
            className="h-10 flex-1"
          />
          <Button type="submit" className="h-10 shrink-0" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Creating…
              </>
            ) : (
              "Shorten"
            )}
          </Button>
          <Button asChild type="button" variant="outline" className="h-10 shrink-0">
            <Link href="/dashboard/links/new">
              <Settings2 className="size-4" aria-hidden="true" />
              <span className="sm:sr-only lg:not-sr-only">More options</span>
            </Link>
          </Button>
        </div>

        {error ? (
          <p id="quick-url-error" role="alert" className="mt-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </form>
    </section>
  )
}
