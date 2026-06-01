'use client'

import { signIn } from "next-auth/react"
import { registerWithEmail } from "@/app/actions/auth"
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
    <div className="relative flex min-h-screen w-full items-center justify-center bg-background p-6 md:p-10 font-sans">
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-10 items-center">
          <Link href="/" className="flex items-center gap-2 text-primary font-bold text-3xl tracking-tight">
            <Link2 className="h-8 w-8 stroke-[3]" />
            LinkForge
          </Link>
          
          <div className="card w-full p-8 shadow-xl">
            <div className="mb-8 text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Create an account</h2>
              <p className="text-sm font-medium text-muted-foreground">Sign up to start creating short links.</p>
            </div>
            
            <div className="space-y-6">
              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    autoComplete="name"
                    required
                    className="h-12"
                    placeholder="Your name"
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
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className="h-12"
                    placeholder="At least 8 characters"
                  />
                </div>
                {error && (
                  <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                    {error}
                  </p>
                )}
                <Button type="submit" className="btn-primary h-12 w-full text-base" disabled={isEmailLoading}>
                  <Mail className="mr-2 h-5 w-5" />
                  {isEmailLoading ? "Creating account..." : "Sign up with Email"}
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
                    <Discord className="mr-3 h-5 w-5 text-[#5865F2]" />
                    Sign up with Discord
                  </>
                )}
              </Button>
            </div>

            <div className="mt-8 text-center text-sm font-medium text-muted-foreground">
               Already have an account? <Link href="/auth/login" className="text-primary hover:underline">Log in</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
