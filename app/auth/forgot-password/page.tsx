'use client'

import { useState } from "react"
import Link from "next/link"
import { AlertCircle, ArrowLeft, Loader2, MailCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthShell } from "@/components/auth/auth-shell"
import { requestPasswordReset } from "@/app/actions/auth"

/**
 * Password reset request.
 *
 * On success the confirmation is deliberately vague about whether an account
 * exists — otherwise this form becomes a way to enumerate registered emails.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setIsLoading(true)

    const result = await requestPasswordReset(email)
    setIsLoading(false)

    if (!result.ok) {
      setError(result.error || "We couldn't send that email. Please try again.")
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <AuthShell
        title="Check your inbox"
        description={
          <>
            If an account exists for <strong className="font-medium text-foreground">{email}</strong>
            , we&apos;ve sent a link to reset its password. The link expires in one hour.
          </>
        }
        footer={
          <Link href="/auth/login" className="link-brand inline-flex items-center gap-1.5 font-medium">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to sign in
          </Link>
        }
      >
        <div className="flex items-start gap-3 rounded-lg border border-border bg-subtle p-4">
          <MailCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            Didn&apos;t get it? Check your spam folder, then{" "}
            <button
              type="button"
              onClick={() => setSent(false)}
              className="link-brand font-medium"
            >
              try a different address
            </button>
            .
          </p>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Reset your password"
      description="Enter the email you signed up with and we'll send you a reset link."
      footer={
        <Link href="/auth/login" className="link-brand inline-flex items-center gap-1.5 font-medium">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "reset-error" : undefined}
            className="h-11"
          />
        </div>

        {error ? (
          <p
            id="reset-error"
            role="alert"
            className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
        ) : null}

        <Button type="submit" size="lg" className="w-full" disabled={isLoading || !email}>
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Sending…
            </>
          ) : (
            "Send reset link"
          )}
        </Button>
      </form>
    </AuthShell>
  )
}
