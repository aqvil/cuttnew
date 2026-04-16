'use client'

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { unlockShortLink } from "@/app/actions/unlock"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, Loader2, Link2 } from "lucide-react"
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
      toast.success("Access granted")
      window.location.href = originalUrl
    } catch (err: any) {
      setError(`Access denied: ${err.message || "Incorrect password"}`)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 font-sans">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-10">
          <div className="flex items-center gap-3 text-primary font-bold text-2xl tracking-tight">
            <Link2 className="h-8 w-8 stroke-[3]" />
            LinkForge
          </div>

          <div className="card w-full text-center p-8 shadow-lg">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-primary">
              <Lock className="h-8 w-8" />
            </div>
            
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Protected Link</h2>
              <p className="text-sm font-medium text-slate-500 mt-2">
                This link requires a password to redirect
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Enter link password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 border-slate-200 bg-white text-center text-lg shadow-sm focus-visible:ring-primary"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 p-3 bg-red-50">
                  <p className="text-sm text-red-600 font-semibold">{error}</p>
                </div>
              )}

              <Button type="submit" className="btn-primary w-full h-12 text-base shadow-lg shadow-primary/20" disabled={isLoading}>
                {isLoading ? (
                   <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Validating...
                  </>
                ) : (
                  "Unlock Link"
                )}
              </Button>
            </form>
          </div>
          
          <p className="text-sm text-slate-400 font-medium tracking-tight">
            Protected by LinkForge Secure Links
          </p>
        </div>
      </div>
    </div>
  )
}
