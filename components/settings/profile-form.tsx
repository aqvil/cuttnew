'use client'

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateProfile } from "@/app/actions/profile"

export function ProfileForm({
  profile,
  email,
}: {
  profile: { displayName: string | null; username: string | null; bio: string | null }
  email: string | null
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<{ message: string; field?: string } | null>(null)

  const [displayName, setDisplayName] = useState(profile.displayName ?? "")
  const [username, setUsername] = useState(profile.username ?? "")
  const [bio, setBio] = useState(profile.bio ?? "")

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await updateProfile({
        displayName,
        username: username.trim() || undefined,
        bio,
      })

      if (!result.ok) {
        setError({ message: result.error, field: result.field })
        toast.error(result.error)
        return
      }

      toast.success("Profile updated.")
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="h2">Profile</h2>
          <p className="lede">How your account appears across the product.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="display-name">Display name</Label>
          <Input
            id="display-name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            maxLength={80}
            aria-invalid={error?.field === "displayName"}
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(event) =>
              setUsername(event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
            }
            maxLength={40}
            aria-invalid={error?.field === "username"}
            aria-describedby="username-help"
            className="h-10 font-mono"
          />
          <p id="username-help" className="text-xs text-muted-foreground">
            Lowercase letters, numbers and underscores. Used for your public bio page URL.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            maxLength={280}
            rows={3}
            aria-describedby="bio-count"
          />
          <p id="bio-count" className="text-xs text-muted-foreground tabular">
            {bio.length}/280
          </p>
        </div>
      </section>

      <section className="space-y-3 border-t border-border pt-8">
        <div className="space-y-1">
          <h2 className="h2">Email</h2>
          <p className="lede">The address you sign in with.</p>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{email || "No email on file"}</p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="size-3 text-success" aria-hidden="true" />
              Verified
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Changing your sign-in email isn&apos;t self-service yet — contact support and
          we&apos;ll move your account.
        </p>
      </section>

      {error ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error.message}
        </p>
      ) : null}

      <div className="border-t border-border pt-6">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Saving…
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </form>
  )
}
