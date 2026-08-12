'use client'

import { useEffect, useRef, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronDown,
  Loader2,
  QrCode,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { CopyButton } from "@/components/app/copy-button"
import { checkAliasAvailability, createLink, type LinkQuota } from "@/app/actions/links"
import { cn } from "@/lib/utils"

/**
 * Create-link form.
 *
 * Optimised for the common case: paste a URL, press Create. Everything else is
 * behind one "More options" disclosure, so the default path is a single field
 * and a button.
 *
 * Alias availability is checked as you type against the server, so a collision
 * is reported before you submit rather than after.
 */

interface CreateLinkFormProps {
  appOrigin: string
  quota: LinkQuota | null
}

type AliasState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "available" }
  | { status: "unavailable"; message: string }

export function CreateLinkForm({ appOrigin, quota }: CreateLinkFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [destination, setDestination] = useState("")
  const [title, setTitle] = useState("")
  const [alias, setAlias] = useState("")
  const [tags, setTags] = useState("")
  const [expiresAt, setExpiresAt] = useState("")
  const [password, setPassword] = useState("")
  const [createQr, setCreateQr] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const [error, setError] = useState<{ message: string; field?: string } | null>(null)
  const [aliasState, setAliasState] = useState<AliasState>({ status: "idle" })
  const [created, setCreated] = useState<{ shortCode: string; id: string } | null>(null)

  const destinationRef = useRef<HTMLInputElement>(null)

  // Pre-fill from ?url= — the marketing page hands off here when an anonymous
  // visitor signs in mid-flow.
  useEffect(() => {
    const url = searchParams.get("url")
    if (url) {
      setDestination(url)
      destinationRef.current?.focus()
    }
  }, [searchParams])

  // Debounced availability check.
  useEffect(() => {
    const value = alias.trim()
    if (!value) {
      setAliasState({ status: "idle" })
      return
    }

    setAliasState({ status: "checking" })
    const timer = setTimeout(async () => {
      const result = await checkAliasAvailability(value)
      setAliasState(
        result.available
          ? { status: "available" }
          : { status: "unavailable", message: result.error || "That back-half is taken." }
      )
    }, 400)

    return () => clearTimeout(timer)
  }, [alias])

  const atQuota = quota?.remaining === 0

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!destination.trim()) {
      setError({ message: "Paste the URL you want to shorten.", field: "destination" })
      destinationRef.current?.focus()
      return
    }

    startTransition(async () => {
      const result = await createLink({
        originalUrl: destination,
        customAlias: alias.trim() || null,
        title: title.trim() || null,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        password: password.trim() || null,
        expiresAt: expiresAt || null,
        createQrCode: createQr,
      })

      if (!result.ok) {
        setError({ message: result.error, field: result.field })
        toast.error(result.error)
        return
      }

      setCreated({ shortCode: result.data.shortCode, id: result.data.id })
      toast.success("Short link created.")
    })
  }

  const resetForm = () => {
    setCreated(null)
    setDestination("")
    setTitle("")
    setAlias("")
    setTags("")
    setExpiresAt("")
    setPassword("")
    setCreateQr(false)
    setError(null)
    setAliasState({ status: "idle" })
    destinationRef.current?.focus()
  }

  if (created) {
    const fullUrl = `${appOrigin}/l/${created.shortCode}`
    return (
      <div className="animate-rise space-y-6 rounded-lg border border-border bg-card p-6">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-success/10 text-success"
          >
            <Check className="size-4" />
          </span>
          <div className="space-y-1">
            <h2 className="text-base font-semibold">Your link is live</h2>
            <p className="text-sm text-muted-foreground">
              It works immediately. Share it anywhere — you can change the destination later
              without breaking it.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-lg border border-border bg-subtle p-3 sm:flex-row sm:items-center">
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

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild>
            <Link href={`/dashboard/links/${created.id}`}>
              View details & analytics
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/dashboard/qr-codes/new?link=${created.id}`}>
              <QrCode className="size-4" aria-hidden="true" />
              Create QR code
            </Link>
          </Button>
          <Button variant="ghost" onClick={resetForm}>
            Create another
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {atQuota ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-medium">You&apos;ve used every link in this month&apos;s allowance</p>
            <p className="text-muted-foreground">
              The {quota?.planName} plan includes {quota?.limit} links per month. Your allowance
              resets on the 1st, or you can{" "}
              <Link href="/dashboard/billing" className="link-brand font-medium">
                upgrade for more
              </Link>
              .
            </p>
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="destination">
          Destination URL <span className="text-destructive">*</span>
        </Label>
        <Input
          id="destination"
          ref={destinationRef}
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
          placeholder="https://example.com/a-very-long-url"
          inputMode="url"
          autoComplete="url"
          autoFocus
          aria-invalid={error?.field === "originalUrl" || error?.field === "destination"}
          aria-describedby="destination-help"
          className="h-11"
        />
        <p id="destination-help" className="text-xs text-muted-foreground">
          The page people land on. We&apos;ll add https:// if you leave it off.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Spring campaign — pricing page"
          maxLength={200}
          className="h-11"
        />
        <p className="text-xs text-muted-foreground">
          Only you see this. It makes links easy to find later.
        </p>
      </div>

      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-md border border-border bg-subtle px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            More options
            <ChevronDown
              className={cn("size-4 transition-transform", advancedOpen && "rotate-180")}
              aria-hidden="true"
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="alias">Custom back-half</Label>
            <div className="flex items-stretch">
              <span className="inline-flex shrink-0 items-center rounded-l-md border border-r-0 border-input bg-subtle px-3 font-mono text-sm text-muted-foreground">
                {appOrigin.replace(/^https?:\/\//, "")}/l/
              </span>
              <Input
                id="alias"
                value={alias}
                onChange={(event) =>
                  setAlias(event.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))
                }
                placeholder="spring-sale"
                maxLength={48}
                aria-invalid={aliasState.status === "unavailable"}
                aria-describedby="alias-status"
                className="h-11 rounded-l-none font-mono"
              />
            </div>
            <p
              id="alias-status"
              role="status"
              aria-live="polite"
              className={cn(
                "flex items-center gap-1.5 text-xs",
                aliasState.status === "available" && "text-success",
                aliasState.status === "unavailable" && "text-destructive",
                (aliasState.status === "idle" || aliasState.status === "checking") &&
                  "text-muted-foreground"
              )}
            >
              {aliasState.status === "checking" ? (
                <>
                  <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                  Checking availability…
                </>
              ) : aliasState.status === "available" ? (
                <>
                  <Check className="size-3" aria-hidden="true" />
                  Available
                </>
              ) : aliasState.status === "unavailable" ? (
                <>
                  <X className="size-3" aria-hidden="true" />
                  {aliasState.message}
                </>
              ) : (
                "Leave blank and we'll generate a short, unguessable code."
              )}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="campaign, q2, email"
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">
              Separate with commas. Tags make filtering large link sets fast.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="expires">Expires on</Label>
              <Input
                id="expires"
                type="datetime-local"
                value={expiresAt}
                onChange={(event) => setExpiresAt(event.target.value)}
                aria-invalid={error?.field === "expiresAt"}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                After this, visitors see an &ldquo;expired&rdquo; page.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Leave blank for none"
                autoComplete="new-password"
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Visitors must enter this before the redirect happens.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-border p-4">
            <Checkbox
              id="create-qr"
              checked={createQr}
              onCheckedChange={(value) => setCreateQr(value === true)}
              className="mt-0.5"
            />
            <div className="space-y-0.5">
              <Label htmlFor="create-qr" className="cursor-pointer font-medium">
                Also create a QR code
              </Label>
              <p className="text-xs text-muted-foreground">
                Scans are tracked separately from clicks, so you can tell print from digital.
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {error ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error.message}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <Button
          type="submit"
          size="lg"
          disabled={isPending || atQuota || aliasState.status === "unavailable"}
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Creating…
            </>
          ) : (
            "Create link"
          )}
        </Button>
        <Button type="button" variant="ghost" asChild>
          <Link href="/dashboard/links">Cancel</Link>
        </Button>

        {quota && quota.remaining !== null ? (
          <p className="ml-auto text-sm text-muted-foreground">
            <span className="font-medium text-foreground tabular">{quota.remaining}</span> of{" "}
            {quota.limit} links left this month
          </p>
        ) : null}
      </div>
    </form>
  )
}
