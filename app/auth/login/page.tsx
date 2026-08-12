'use client'

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { AlertCircle, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthShell } from "@/components/auth/auth-shell"
import { DiscordIcon } from "@/components/auth/discord-icon"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = safeCallback(searchParams.get("callbackUrl"))

  const [error, setError] = useState<string | null>(null)
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [isDiscordLoading, setIsDiscordLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsEmailLoading(true)

    const formData = new FormData(event.currentTarget)
    const result = await signIn("credentials", {
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
      redirect: false,
    })

    setIsEmailLoading(false)

    if (!result || result.error) {
      // Deliberately identical for "no such account" and "wrong password" —
      // a distinct message would let anyone test which emails are registered.
      setError("That email and password don't match an account.")
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <AuthShell
      title="Sign in"
      description="Welcome back. Pick up where you left off."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/auth/sign-up" className="link-brand font-medium">
            Create one free
          </Link>
        </>
      }
    >
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              aria-invalid={Boolean(error)}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "login-error" : undefined}
              className="h-11"
            />
          </div>

          {error ? (
            <p
              id="login-error"
              role="alert"
              className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {error}
            </p>
          ) : null}

          <Button type="submit" size="lg" className="w-full" disabled={isEmailLoading}>
            {isEmailLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <div className="relative">
          <span className="absolute inset-0 flex items-center" aria-hidden="true">
            <span className="w-full border-t border-border" />
          </span>
          <span className="relative flex justify-center">
            <span className="bg-background px-3 text-xs text-muted-foreground">or</span>
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          disabled={isDiscordLoading}
          onClick={() => {
            setIsDiscordLoading(true)
            signIn("discord", { callbackUrl })
          }}
        >
          {isDiscordLoading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <DiscordIcon className="size-4" />
          )}
          Continue with Discord
        </Button>
      </div>
    </AuthShell>
  )
}

/**
 * Only same-origin paths are honoured. Accepting an arbitrary `callbackUrl`
 * would turn the sign-in page into an open redirect that phishing campaigns
 * could dress up with a legitimate domain.
 */
function safeCallback(value: string | null): string {
  if (!value) return "/dashboard"
  if (!value.startsWith("/") || value.startsWith("//")) return "/dashboard"
  return value
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
