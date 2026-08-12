'use client'

import { useEffect, useRef, useState } from "react"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { submitContactMessage } from "@/app/actions/contact"

const MAX_MESSAGE = 5000

/**
 * Contact form.
 *
 * Two of the anti-spam measures live here and are invisible to real users:
 * a honeypot field that is hidden from sighted users *and* from assistive
 * technology (aria-hidden + tabIndex -1, so a screen-reader user never
 * encounters it), and a render timestamp the server uses to reject
 * instantaneous submissions. The rest — rate limiting, validation, optional
 * Turnstile — are enforced server-side where they can't be bypassed.
 */
export function ContactForm({ turnstileSiteKey }: { turnstileSiteKey: string | null }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [company, setCompany] = useState("") // honeypot

  const [error, setError] = useState<{ message: string; field?: string } | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)

  const renderedAt = useRef<number>(0)
  useEffect(() => {
    renderedAt.current = Date.now()
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setIsSending(true)

    const turnstileToken = turnstileSiteKey
      ? ((document.querySelector('[name="cf-turnstile-response"]') as HTMLInputElement | null)
          ?.value ?? undefined)
      : undefined

    const result = await submitContactMessage({
      name,
      email,
      subject,
      message,
      company,
      renderedAt: renderedAt.current,
      turnstileToken,
    })

    setIsSending(false)

    if (!result.ok) {
      setError({ message: result.error, field: result.field })
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <span
          aria-hidden="true"
          className="mx-auto mb-4 flex size-10 items-center justify-center rounded-full bg-success/10 text-success"
        >
          <CheckCircle2 className="size-5" />
        </span>
        <h2 className="text-lg font-semibold">Message received</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          Thanks — we&apos;ve got it. We reply to everything, usually within one business day, to
          the address you gave us.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => {
            setSent(false)
            setSubject("")
            setMessage("")
            renderedAt.current = Date.now()
          }}
        >
          Send another message
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/*
        Honeypot. Hidden from everyone: display isn't used (some bots detect
        that) — it's positioned off-screen, removed from the tab order, and
        aria-hidden so screen readers skip it entirely.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden"
      >
        <label htmlFor="contact-company">Company (leave this empty)</label>
        <input
          id="contact-company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(event) => setCompany(event.target.value)}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name">
            Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="contact-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            required
            maxLength={100}
            aria-invalid={error?.field === "name"}
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-email">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="contact-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            maxLength={254}
            aria-invalid={error?.field === "email"}
            className="h-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-subject">Subject</Label>
        <Input
          id="contact-subject"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          maxLength={150}
          placeholder="What's this about?"
          className="h-10"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message">
          Message <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="contact-message"
          value={message}
          onChange={(event) => setMessage(event.target.value.slice(0, MAX_MESSAGE))}
          rows={6}
          required
          aria-invalid={error?.field === "message"}
          aria-describedby="message-count"
        />
        <p id="message-count" className="text-xs text-muted-foreground tabular">
          {message.length.toLocaleString()} / {MAX_MESSAGE.toLocaleString()}
        </p>
      </div>

      {turnstileSiteKey ? (
        <div
          className="cf-turnstile"
          data-sitekey={turnstileSiteKey}
          data-theme="auto"
        />
      ) : null}

      {error ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error.message}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={isSending}>
        {isSending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Sending…
          </>
        ) : (
          "Send message"
        )}
      </Button>

      <p className="text-xs leading-5 text-muted-foreground">
        We use your message and email address only to reply to you. Submissions are stored on our
        servers, never forwarded to a third party.
      </p>
    </form>
  )
}
