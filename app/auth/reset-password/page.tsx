'use client'

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertCircle, ArrowLeft, Check, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthShell } from "@/components/auth/auth-shell"
import { resetPassword } from "@/app/actions/auth"
import { cn } from "@/lib/utils"

const MIN_PASSWORD_LENGTH = 8

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""
  const email = searchParams.get("email") ?? ""

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [done, setDone] = useState(false)

  const longEnough = password.length >= MIN_PASSWORD_LENGTH
  const matches = password.length > 0 && password === confirm

  if (!token || !email) {
    return (
      <AuthShell
        title="This reset link isn't valid"
        description="It may have been copied incompletely, or it has already been used."
        footer={
          <Link href="/auth/forgot-password" className="link-brand font-medium">
            Request a new reset link
          </Link>
        }
      >
        <Button asChild variant="outline" className="w-full">
          <Link href="/auth/login">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to sign in
          </Link>
        </Button>
      </AuthShell>
    )
  }

  if (done) {
    return (
      <AuthShell
        title="Password updated"
        description="You can now sign in with your new password."
      >
        <Button size="lg" className="w-full" onClick={() => router.push("/auth/login")}>
          Continue to sign in
        </Button>
      </AuthShell>
    )
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!matches) {
      setError("Those passwords don't match.")
      return
    }

    setIsLoading(true)
    const result = await resetPassword({ email, token, password })
    setIsLoading(false)

    if (!result.ok) {
      setError(result.error || "We couldn't reset your password.")
      return
    }

    setDone(true)
  }

  return (
    <AuthShell
      title="Choose a new password"
      description={
        <>
          For <strong className="font-medium text-foreground">{email}</strong>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-describedby="password-requirement"
            className="h-11"
          />
          <p
            id="password-requirement"
            className={cn(
              "flex items-center gap-1.5 text-xs",
              longEnough ? "text-success" : "text-muted-foreground"
            )}
          >
            {longEnough ? <Check className="size-3" aria-hidden="true" /> : null}
            At least {MIN_PASSWORD_LENGTH} characters
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm new password</Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            aria-invalid={confirm.length > 0 && !matches}
            className="h-11"
          />
          {confirm.length > 0 && !matches ? (
            <p className="text-xs text-destructive">Passwords don&apos;t match.</p>
          ) : null}
        </div>

        {error ? (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isLoading || !longEnough || !matches}
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Updating…
            </>
          ) : (
            "Update password"
          )}
        </Button>
      </form>
    </AuthShell>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  )
}
