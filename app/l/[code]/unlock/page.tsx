'use client'

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { unlockShortLink } from "@/app/actions/unlock"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
      toast.success("SEQUENCE_UNLOCKED")
      window.location.href = originalUrl
    } catch (err: any) {
      setError(`ACCESS_DENIED: ${err.message?.toUpperCase() || "UNKNOWN_ERROR"}`)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 bg-[url('https://discbot.io/grid.png')] bg-repeat">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-10">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center border-4 border-primary bg-primary text-primary-foreground transform -rotate-12">
              <Link2 className="h-6 w-6" />
            </div>
            <span className="text-4xl font-black uppercase italic tracking-tighter">LinkForge</span>
          </div>

          <div className="card-mono w-full text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center border-4 border-primary bg-muted/20">
              <Lock className="h-8 w-8" />
            </div>
            
            <div className="mb-8">
              <h2 className="text-2xl font-black uppercase italic tracking-tight">Node Locked</h2>
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mt-2">
                Authorization key required for redirection
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="DECRYPTION_KEY"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-2 border-primary bg-background font-bold h-12 uppercase text-center"
                />
              </div>

              {error && (
                <div className="border-2 border-destructive p-3 bg-destructive/10">
                  <p className="text-[10px] font-mono uppercase text-destructive font-black tracking-widest">{error}</p>
                </div>
              )}

              <Button type="submit" className="btn-mono w-full h-14 text-lg" disabled={isLoading}>
                {isLoading ? (
                   <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    DECRYPTING...
                  </>
                ) : (
                  "UNLOCK_SEGMENT"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
