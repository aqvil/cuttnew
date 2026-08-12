'use client'

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { AlertCircle, Check, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthShell } from "@/components/auth/auth-shell"
import { DiscordIcon } from "@/components/auth/discord-icon"
import { registerWithEmail } from "@/app/actions/auth"
import { cn } from "@/lib/utils"

const MIN_PASSWORD_LENGTH = 8

export default function SignUpPage() {
  const router = useRouter()
  const [error, setError] = useState<{ message: string; field?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDiscordLoading, setIsDiscordLoading] = useState(false)
  const [password, setPassword] = useState("")

  const passwordLongEnough = password.length >= MIN_PASSWORD_LENGTH

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") || "")
    const rawPassword = String(formData.get("password") || "")

    const result = await registerWithEmail({
      name: String(formData.get("name") || ""),
      email,
      password: rawPassword,
    })

    if (!result.ok) {
      setError({ message: result.error || "We couldn't create your account.", field: result.field })
      setIsLoading(false)
      return
    }

    // Sign in immediately so the new account lands on the dashboard rather
    // than back at a login form.
    const signInResult = await signIn("credentials", {
      email,
      password: rawPassword,
      redirect: false,
    })

    setIsLoading(false)

    if (!signInResult || signInResult.error) {
      setError({
        message: "Your account was created, but automatic sign-in failed. Please sign in.",
      })
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <AuthShell
      title="Create your account"
      description="Free forever for 50 links a month. No card required."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/auth/login" className="link-brand font-medium">
            Sign in
          </Link>
        </>
      }
    >
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              required
              placeholder="Alex Rivera"
              aria-invalid={error?.field === "name"}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              aria-invalid={error?.field === "email"}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={error?.field === "password"}
              aria-describedby="password-requirement"
              className="h-11"
            />
            <p
              id="password-requirement"
              className={cn(
                "flex items-center gap-1.5 text-xs",
                password.length === 0
                  ? "text-muted-foreground"
                  : passwordLongEnough
                    ? "text-success"
                    : "text-muted-foreground"
              )}
            >
              {passwordLongEnough ? (
                <Check className="size-3" aria-hidden="true" />
              ) : null}
              At least {MIN_PASSWORD_LENGTH} characters
            </p>
          </div>

          {error ? (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {error.message}
            </p>
          ) : null}

          <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Creating account…
              </>
            ) : (
              "Create account"
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
            signIn("discord", { callbackUrl: "/dashboard" })
          }}
        >
          {isDiscordLoading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <DiscordIcon className="size-4" />
          )}
          Continue with Discord
        </Button>

        <p className="text-xs leading-5 text-muted-foreground">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </AuthShell>
  )
}
