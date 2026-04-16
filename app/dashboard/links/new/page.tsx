'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Loader2, Sparkles } from "lucide-react"
import Link from "next/link"

function generateShortCode(length: number = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export default function NewLinkPage() {
  const [originalUrl, setOriginalUrl] = useState("")
  const [title, setTitle] = useState("")
  const [customSlug, setCustomSlug] = useState("")
  const [useCustomSlug, setUseCustomSlug] = useState(false)
  const [password, setPassword] = useState("")
  const [usePassword, setUsePassword] = useState(false)
  const [expiresAt, setExpiresAt] = useState("")
  const [useExpiration, setUseExpiration] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!originalUrl) {
      setError("Please enter a URL")
      setIsLoading(false)
      return
    }

    // Validate URL
    try {
      new URL(originalUrl)
    } catch {
      setError("Please enter a valid URL")
      setIsLoading(false)
      return
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError("You must be logged in")
      setIsLoading(false)
      return
    }

    const shortCode = useCustomSlug && customSlug ? customSlug : generateShortCode()

    const { data, error: insertError } = await supabase
      .from("short_links")
      .insert({
        user_id: user.id,
        original_url: originalUrl,
        short_code: shortCode,
        title: title || null,
        password: usePassword && password ? password : null,
        is_password_protected: usePassword && !!password,
        expires_at: useExpiration && expiresAt ? new Date(expiresAt).toISOString() : null,
        click_count: 0,
      })
      .select()
      .single()

    if (insertError) {
      if (insertError.message.includes("duplicate")) {
        setError("This custom slug is already taken. Please choose a different one.")
      } else {
        setError(insertError.message)
      }
      setIsLoading(false)
      return
    }

    router.push(`/dashboard/links/${data.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/links">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Short Link</h1>
          <p className="text-muted-foreground">Shorten any URL with custom options</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Link Details</CardTitle>
          <CardDescription>Enter the URL you want to shorten</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="url">Destination URL *</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/my-long-url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title (optional)</Label>
              <Input
                id="title"
                placeholder="My Awesome Link"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                A friendly name to identify this link
              </p>
            </div>

            {/* Custom Slug */}
            <div className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Custom Slug</Label>
                  <p className="text-xs text-muted-foreground">
                    Use your own custom short URL
                  </p>
                </div>
                <Switch
                  checked={useCustomSlug}
                  onCheckedChange={setUseCustomSlug}
                />
              </div>
              {useCustomSlug && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">/l/</span>
                    <Input
                      placeholder="my-custom-slug"
                      value={customSlug}
                      onChange={(e) => setCustomSlug(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Password Protection */}
            <div className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Password Protection</Label>
                  <p className="text-xs text-muted-foreground">
                    Require a password to access this link
                  </p>
                </div>
                <Switch
                  checked={usePassword}
                  onCheckedChange={setUsePassword}
                />
              </div>
              {usePassword && (
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Expiration */}
            <div className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Expiration Date</Label>
                  <p className="text-xs text-muted-foreground">
                    Set when this link should expire
                  </p>
                </div>
                <Switch
                  checked={useExpiration}
                  onCheckedChange={setUseExpiration}
                />
              </div>
              {useExpiration && (
                <div className="space-y-2">
                  <Input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                </div>
              )}
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex items-center gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Link
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/links">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
