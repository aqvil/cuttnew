'use client'

import { useState } from "react"
import { useParams } from "next/navigation"
import { unlockShortLink } from "@/app/actions/unlock"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, Loader2, Link2, ArrowRight } from "lucide-react"
import { toast } from "sonner"

export default function UnlockLinkPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const params = useParams()
  const code = params.code as string

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const originalUrl = await unlockShortLink(code, password)
      toast.success("Access granted — redirecting…")
      window.location.href = originalUrl
    } catch (err: any) {
      setError("Incorrect password. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      {/* Grid bg */}
      <div className="fixed inset-0 mono-grid opacity-50 pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 flex items-center justify-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-md bg-foreground text-background">
            <Link2 className="size-3.5 stroke-[3]" />
          </span>
          <span className="text-lg font-bold tracking-tight">Cuttly</span>
        </div>

        {/* Card */}
        <div className="dash-panel p-8">
          <div className="text-center mb-8">
            <div className="dash-icon size-14 mx-auto mb-5">
              <Lock className="size-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Protected link</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This link requires a password before it can redirect you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter link password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                className="h-12 text-sm text-center tracking-widest placeholder:tracking-normal"
              />
            </div>

            {error && (
              <div className="rounded-md border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive font-medium text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="btn-primary w-full h-11"
              disabled={isLoading || !password}
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  Unlock link
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Redirects are protected by{" "}
          <a href="/" className="underline hover:text-foreground">Cuttly</a>
        </p>
      </div>
    </div>
  )
}
