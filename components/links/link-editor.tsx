'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ShortLink } from "@/lib/types/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Loader2, ExternalLink, Copy, Check, Trash2, QrCode } from "lucide-react"
import Link from "next/link"

interface LinkEditorProps {
  link: ShortLink
}

export function LinkEditor({ link }: LinkEditorProps) {
  const [originalUrl, setOriginalUrl] = useState(link.original_url)
  const [title, setTitle] = useState(link.title || "")
  const [password, setPassword] = useState("")
  const [usePassword, setUsePassword] = useState(link.is_password_protected)
  const [expiresAt, setExpiresAt] = useState(
    link.expires_at ? new Date(link.expires_at).toISOString().slice(0, 16) : ""
  )
  const [useExpiration, setUseExpiration] = useState(!!link.expires_at)
  const [isActive, setIsActive] = useState(link.is_active)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://linkforge.app"
  const shortUrl = `${baseUrl}/l/${link.short_code}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)

    const supabase = createClient()

    const updateData: Partial<ShortLink> = {
      original_url: originalUrl,
      title: title || null,
      is_password_protected: usePassword,
      is_active: isActive,
      expires_at: useExpiration && expiresAt ? new Date(expiresAt).toISOString() : null,
      updated_at: new Date().toISOString(),
    }

    // Only update password if a new one is provided
    if (usePassword && password) {
      updateData.password = password
    } else if (!usePassword) {
      updateData.password = null
    }

    const { error: updateError } = await supabase
      .from("short_links")
      .update(updateData)
      .eq("id", link.id)

    if (updateError) {
      setError(updateError.message)
      setIsSaving(false)
      return
    }

    setIsSaving(false)
    router.refresh()
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    const supabase = createClient()

    await supabase.from("short_links").delete().eq("id", link.id)
    router.push("/dashboard/links")
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/links">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Link</h1>
            <p className="text-muted-foreground">{link.short_code}</p>
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this link?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the short link
                and all associated analytics data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Short URL Card */}
      <Card>
        <CardHeader>
          <CardTitle>Short URL</CardTitle>
          <CardDescription>Share this link with anyone</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input
              value={shortUrl}
              readOnly
              className="font-mono"
            />
            <Button variant="outline" onClick={handleCopy}>
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button variant="outline" asChild>
              <a href={shortUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-lg bg-muted p-3">
            <div>
              <p className="text-sm font-medium">Total Clicks</p>
              <p className="text-2xl font-bold">{link.click_count}</p>
            </div>
            <Button variant="outline" asChild>
              <Link href={`/dashboard/analytics?link=${link.id}`}>
                View Analytics
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Link Settings</CardTitle>
          <CardDescription>Modify your link settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label>Active Status</Label>
                <p className="text-xs text-muted-foreground">
                  Disable to temporarily deactivate this link
                </p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Destination URL</Label>
              <Input
                id="url"
                type="url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="My Awesome Link"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Password Protection */}
            <div className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Password Protection</Label>
                  <p className="text-xs text-muted-foreground">
                    {link.is_password_protected ? "Currently protected" : "Not protected"}
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
                    placeholder={link.is_password_protected ? "Enter new password (leave empty to keep current)" : "Enter password"}
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
                    {link.expires_at 
                      ? `Expires ${new Date(link.expires_at).toLocaleDateString()}`
                      : "No expiration set"
                    }
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
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/links">Cancel</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
