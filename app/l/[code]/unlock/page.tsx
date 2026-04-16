'use client'

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Loader2, Link2 } from "lucide-react"

export default function UnlockLinkPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const params = useParams()
  const router = useRouter()
  const code = params.code as string

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    const { data: link, error: fetchError } = await supabase
      .from("short_links")
      .select("*")
      .eq("short_code", code)
      .single()

    if (fetchError || !link) {
      setError("Link not found")
      setIsLoading(false)
      return
    }

    if (link.password !== password) {
      setError("Incorrect password")
      setIsLoading(false)
      return
    }

    // Record click analytics
    supabase.from("link_analytics").insert({
      short_link_id: link.id,
    })

    // Increment click count
    supabase.from("short_links").update({ 
      click_count: link.click_count + 1 
    }).eq("id", link.id)

    // Redirect to destination
    window.location.href = link.original_url
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground">
              <Link2 className="h-5 w-5 text-background" />
            </div>
            <span className="text-xl font-semibold">LinkForge</span>
          </div>

          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Lock className="h-6 w-6" />
              </div>
              <CardTitle>Password Protected</CardTitle>
              <CardDescription>
                This link is protected. Enter the password to continue.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Unlock
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
