'use client'

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AlertCircle, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { updateLink } from "@/app/actions/links"
import type { OwnedLink } from "@/lib/links/queries"

/**
 * Link settings.
 *
 * Grouped by intent — what it points at, when it stops working, who can open
 * it, where mobile visitors go — rather than presented as one long column of
 * inputs. Field-level errors come back from the server action and are attached
 * to the input that caused them.
 */
export function LinkSettingsForm({ link }: { link: OwnedLink }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<{ message: string; field?: string } | null>(null)

  const [destination, setDestination] = useState(link.originalUrl)
  const [title, setTitle] = useState(link.title ?? "")
  const [tags, setTags] = useState((link.tags ?? []).join(", "))
  const [isActive, setIsActive] = useState(link.isActive ?? true)

  const [useExpiry, setUseExpiry] = useState(Boolean(link.expiresAt))
  const [expiresAt, setExpiresAt] = useState(toLocalInput(link.expiresAt))
  const [expirationUrl, setExpirationUrl] = useState(link.expirationUrl ?? "")
  const [maxClicks, setMaxClicks] = useState(link.maxClicks ? String(link.maxClicks) : "")

  const [changePassword, setChangePassword] = useState(false)
  const [password, setPassword] = useState("")

  const [iosUrl, setIosUrl] = useState(link.iosUrl ?? "")
  const [androidUrl, setAndroidUrl] = useState(link.androidUrl ?? "")

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await updateLink(link.id, {
        originalUrl: destination,
        title: title.trim() || null,
        tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        isActive,
        expiresAt: useExpiry ? expiresAt || null : null,
        expirationUrl: expirationUrl.trim() || null,
        maxClicks: maxClicks.trim() || null,
        iosUrl: iosUrl.trim() || null,
        androidUrl: androidUrl.trim() || null,
        // `undefined` leaves the existing password alone; only send a value
        // when the user explicitly chose to change it.
        ...(changePassword ? { password: password.trim() || null } : {}),
      })

      if (!result.ok) {
        setError({ message: result.error, field: result.field })
        toast.error(result.error)
        return
      }

      toast.success("Changes saved.")
      setChangePassword(false)
      setPassword("")
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10" noValidate>
      <Fieldset
        legend="Destination"
        hint="Change this any time — the short link keeps working."
      >
        <Field label="Destination URL" htmlFor="destination" required>
          <Input
            id="destination"
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            aria-invalid={error?.field === "originalUrl"}
            inputMode="url"
            className="h-10"
          />
        </Field>

        <Field label="Title" htmlFor="title" hint="Private to your account.">
          <Input
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={200}
            className="h-10"
          />
        </Field>

        <Field label="Tags" htmlFor="tags" hint="Comma separated.">
          <Input
            id="tags"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="campaign, q2"
            className="h-10"
          />
        </Field>

        <div className="flex items-start justify-between gap-6 rounded-lg border border-border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="is-active" className="font-medium">
              Link is active
            </Label>
            <p className="text-xs text-muted-foreground">
              Turn off to pause redirects without deleting the link. Visitors see a
              &ldquo;paused&rdquo; page.
            </p>
          </div>
          <Switch id="is-active" checked={isActive} onCheckedChange={setIsActive} />
        </div>
      </Fieldset>

      <Fieldset legend="Expiry" hint="Stop the link redirecting after a date or a click cap.">
        <div className="flex items-start justify-between gap-6 rounded-lg border border-border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="use-expiry" className="font-medium">
              Expire on a date
            </Label>
            <p className="text-xs text-muted-foreground">
              After this moment the link stops redirecting.
            </p>
          </div>
          <Switch id="use-expiry" checked={useExpiry} onCheckedChange={setUseExpiry} />
        </div>

        {useExpiry ? (
          <Field label="Expires at" htmlFor="expires-at">
            <Input
              id="expires-at"
              type="datetime-local"
              value={expiresAt}
              onChange={(event) => setExpiresAt(event.target.value)}
              aria-invalid={error?.field === "expiresAt"}
              className="h-10"
            />
          </Field>
        ) : null}

        <Field
          label="Click limit"
          htmlFor="max-clicks"
          hint="Leave blank for unlimited. The link expires once this many clicks are recorded."
        >
          <Input
            id="max-clicks"
            type="number"
            min={1}
            inputMode="numeric"
            value={maxClicks}
            onChange={(event) => setMaxClicks(event.target.value)}
            placeholder="Unlimited"
            aria-invalid={error?.field === "maxClicks"}
            className="h-10"
          />
        </Field>

        <Field
          label="Redirect after expiry"
          htmlFor="expiration-url"
          hint="Optional. Send expired traffic here instead of showing the expired page."
        >
          <Input
            id="expiration-url"
            value={expirationUrl}
            onChange={(event) => setExpirationUrl(event.target.value)}
            placeholder="https://example.com/campaign-ended"
            aria-invalid={error?.field === "expirationUrl"}
            className="h-10"
          />
        </Field>
      </Fieldset>

      <Fieldset legend="Access" hint="Require a password before the redirect happens.">
        {link.hasPassword && !changePassword ? (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">This link is password protected</p>
              <p className="text-xs text-muted-foreground">
                For your security the current password can&apos;t be shown.
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setChangePassword(true)}>
                Change
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setChangePassword(true)
                  setPassword("")
                }}
              >
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <Field
            label={link.hasPassword ? "New password" : "Password"}
            htmlFor="password"
            hint={
              link.hasPassword
                ? "Leave blank and save to remove password protection."
                : "Leave blank for an open link."
            }
          >
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                setChangePassword(true)
              }}
              onFocus={() => setChangePassword(true)}
              autoComplete="new-password"
              className="h-10"
            />
          </Field>
        )}
      </Fieldset>

      <Fieldset
        legend="Mobile targeting"
        hint="Send iOS and Android visitors somewhere else — an App Store page, for example. Everyone else gets the main destination."
      >
        <Field label="iOS destination" htmlFor="ios-url">
          <Input
            id="ios-url"
            value={iosUrl}
            onChange={(event) => setIosUrl(event.target.value)}
            placeholder="https://apps.apple.com/…"
            aria-invalid={error?.field === "iosUrl"}
            className="h-10"
          />
        </Field>

        <Field label="Android destination" htmlFor="android-url">
          <Input
            id="android-url"
            value={androidUrl}
            onChange={(event) => setAndroidUrl(event.target.value)}
            placeholder="https://play.google.com/…"
            aria-invalid={error?.field === "androidUrl"}
            className="h-10"
          />
        </Field>
      </Fieldset>

      {error ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error.message}
        </p>
      ) : null}

      <div className="sticky bottom-0 -mx-1 flex items-center gap-3 border-t border-border bg-background/90 px-1 py-4 backdrop-blur">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Saving…
            </>
          ) : (
            "Save changes"
          )}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.refresh()} disabled={isPending}>
          Discard
        </Button>
      </div>
    </form>
  )
}

function Fieldset({
  legend,
  hint,
  children,
}: {
  legend: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <fieldset className="space-y-4">
      <legend className="mb-1 space-y-1">
        <span className="block text-sm font-semibold">{legend}</span>
        {hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}
      </legend>
      {children}
    </fieldset>
  )
}

function Field({
  label,
  htmlFor,
  hint,
  required,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

/** `datetime-local` needs a local-time string, not an ISO/UTC one. */
function toLocalInput(value: Date | string | null): string {
  if (!value) return ""
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ""

  const pad = (n: number) => String(n).padStart(2, "0")
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  )
}
