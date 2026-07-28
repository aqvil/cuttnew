'use client'

import { signIn } from "next-auth/react"
import { registerWithEmail } from "@/app/actions/auth"
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GamePromoPanel } from '@/components/auth/game-promo-panel'
import { Link2, DiscIcon as Discord, Mail } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const [isDiscordLoading, setIsDiscordLoading] = useState(false)
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleDiscordLogin = () => {
    setIsDiscordLoading(true)
    signIn("discord", { callbackUrl: "/dashboard" })
  }

  const handleEmailSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsEmailLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") || "")
    const password = String(formData.get("password") || "")
    const result = await registerWithEmail({
      name: String(formData.get("name") || ""),
      email,
      password,
    })

    if (!result.ok) {
      setError(result.error || "Could not create your account.")
      setIsEmailLoading(false)
      return
    }

    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/dashboard",
    })

    setIsEmailLoading(false)

    if (signInResult?.error) {
      setError("Account created, but automatic login failed. Please log in.")
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="relative min-h-screen w-full bg-background p-6 font-sans md:p-10">
      <div className="absolute right-5 top-5 z-10">
        <ThemeToggle />
      </div>

      <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center gap-8 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <GamePromoPanel />
        </div>

        <div className="order-1 flex flex-col items-center gap-8 lg:order-2">
          <Link href="/" className="flex items-center gap-2 text-primary font-bold text-2xl tracking-tight">
            <Link2 className="h-7 w-7 stroke-[3]" />
            Cuttly
          </Link>

          <div className="w-full max-w-sm rounded-md border border-border bg-card p-8 shadow-[var(--shadow-card)]">
            <div className="mb-8 space-y-2">
              <div className="inline-flex items-center gap-2 rounded-sm border border-border bg-background px-2.5 py-1 text-[10px] font-black uppercase tracking-[2px] text-muted-foreground">
                New account
              </div>
              <h2 className="text-2xl font-black uppercase tracking-[1px] text-foreground">Create account</h2>
              <p className="text-sm font-medium text-muted-foreground">Sign up to start creating short links.</p>
            </div>

            <div className="space-y-6">
              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-[1px] text-muted-foreground">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    autoComplete="name"
                    required
                    className="h-12 rounded-sm bg-background font-mono"
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-[1px] text-muted-foreground">Email address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="h-12 rounded-sm bg-background font-mono"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-[1px] text-muted-foreground">Password (min 8 characters)</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className="h-12 rounded-sm bg-background font-mono"
                    placeholder="At least 8 characters"
                  />
                </div>
                {error && (
                  <p className="rounded-sm border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                    {error}
                  </p>
                )}
                <Button type="submit" className="h-12 w-full rounded-full text-sm font-bold uppercase tracking-[1px]" disabled={isEmailLoading}>
                  <Mail className="mr-2 h-5 w-5" />
                  {isEmailLoading ? "Creating account..." : "Create account"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[1px]">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <Button
                onClick={handleDiscordLogin}
                disabled={isDiscordLoading}
                variant="outline"
                className="w-full h-12 rounded-full bg-card hover:bg-muted text-foreground font-bold uppercase tracking-[1px] text-sm border-border transition-all"
              >
                {isDiscordLoading ? (
                  "Connecting..."
                ) : (
                  <>
                    <Discord className="mr-3 h-5 w-5 text-foreground" />
                    Sign up with Discord
                  </>
                )}
              </Button>
            </div>

            <div className="mt-8 text-center text-sm font-medium text-muted-foreground">
               Already have an account? <Link href="/auth/login" className="text-primary hover:underline">Log in</Link>
            </div>
          </div>

          <p className="text-center text-[10px] font-bold uppercase tracking-[1.5px] text-muted-foreground">
            Encrypted connection // your session is secure
          </p>
        </div>
      </div>
    </div>
  )
}
