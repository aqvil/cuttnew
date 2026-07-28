'use client'

import { signIn } from "next-auth/react"
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link2, DiscIcon as Discord, Mail } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [isDiscordLoading, setIsDiscordLoading] = useState(false)
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleDiscordLogin = () => {
    setIsDiscordLoading(true)
    signIn("discord", { callbackUrl: "/dashboard" })
  }

  const handleEmailLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsEmailLoading(true)

    const formData = new FormData(event.currentTarget)
    const result = await signIn("credentials", {
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
      redirect: false,
      callbackUrl: "/dashboard",
    })

    setIsEmailLoading(false)

    if (result?.error) {
      setError("That email and password combination does not match an account.")
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-background p-6 md:p-10 font-sans">
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-10 items-center">
          <Link href="/" className="flex items-center gap-2 text-primary font-bold text-3xl tracking-tight">
            <Link2 className="h-8 w-8 stroke-[3]" />
            Cuttly
          </Link>

          <div className="card w-full p-8 shadow-xl">
            <div className="mb-8 text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Log in to Cuttly</h2>
              <p className="text-sm font-medium text-muted-foreground">Welcome back to your short links.</p>
            </div>
            
            <div className="space-y-6">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="h-12"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="h-12"
                    placeholder="Your password"
                  />
                </div>
                {error && (
                  <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                    {error}
                  </p>
                )}
                <Button type="submit" className="btn-primary h-12 w-full text-base" disabled={isEmailLoading}>
                  <Mail className="mr-2 h-5 w-5" />
                  {isEmailLoading ? "Logging in..." : "Log in with Email"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs font-semibold uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <Button 
                onClick={handleDiscordLogin} 
                disabled={isDiscordLoading}
                variant="outline"
                className="w-full h-12 bg-card hover:bg-muted text-foreground font-semibold text-base border-border shadow-sm transition-all"
              >
                {isDiscordLoading ? (
                  "Connecting..."
                ) : (
                  <>
                    <Discord className="mr-3 h-5 w-5 text-foreground" />
                    Continue with Discord
                  </>
                )}
              </Button>
            </div>

            <div className="mt-8 text-center text-sm font-medium text-muted-foreground">
               Don't have an account? <Link href="/auth/sign-up" className="text-primary hover:underline">Sign up</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
