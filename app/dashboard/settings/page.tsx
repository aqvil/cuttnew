"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2, AtSign } from "lucide-react"
import type { Profile } from "@/lib/types/database"
import Link from "next/link"

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [email, setEmail] = useState("")
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setEmail(user.email || "")

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (data) {
        setProfile(data as Profile)
      }
      setLoading(false)
    }

    loadProfile()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!profile) return

    setSaving(true)
    const formData = new FormData(e.currentTarget)

    const { error } = await supabase
      .from("profiles")
      .update({
        username: formData.get("username") as string,
        display_name: formData.get("display_name") as string,
        bio: formData.get("bio") as string,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id)

    setSaving(false)

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Settings saved",
        description: "Your profile has been updated.",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account settings and profile
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        {/* Profile Section */}
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-medium">Profile Information</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Update your personal information
            </p>
          </div>
          <div className="space-y-4 p-5">
            <div className="space-y-2">
              <Label htmlFor="display_name" className="text-xs font-medium">
                Display Name
              </Label>
              <Input
                id="display_name"
                name="display_name"
                defaultValue={profile?.display_name || ""}
                placeholder="Your name"
                className="h-9 bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs font-medium">
                Username
              </Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  name="username"
                  defaultValue={profile?.username || ""}
                  placeholder="username"
                  className="h-9 bg-background pl-9"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                This will be used for your public profile URL
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-xs font-medium">
                Bio
              </Label>
              <Textarea
                id="bio"
                name="bio"
                defaultValue={profile?.bio || ""}
                placeholder="Tell us about yourself..."
                rows={3}
                className="bg-background resize-none"
              />
            </div>
          </div>
        </div>

        {/* Email Section */}
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-medium">Email</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Your email address is used for signing in
            </p>
          </div>
          <div className="p-5">
            <Input
              type="email"
              value={email}
              disabled
              className="h-9 bg-muted"
            />
            <p className="mt-2 text-[11px] text-muted-foreground">
              Contact support to change your email address
            </p>
          </div>
        </div>

        {/* Subscription Section */}
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-medium">Subscription</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Your current plan
            </p>
          </div>
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm font-medium capitalize">{profile?.plan || "free"} Plan</p>
              <p className="text-xs text-muted-foreground">
                {profile?.plan === "free" 
                  ? "Upgrade to unlock more features"
                  : "You have access to all premium features"}
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/billing">Manage</Link>
            </Button>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving} className="h-9">
            {saving ? (
              <>
                <Loader2 className="mr-2 size-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="max-w-xl rounded-lg border border-destructive/50 bg-card">
        <div className="border-b border-destructive/50 px-5 py-4">
          <h2 className="text-sm font-medium text-destructive">Danger Zone</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Irreversible actions
          </p>
        </div>
        <div className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm font-medium">Delete Account</p>
            <p className="text-xs text-muted-foreground">
              Permanently delete your account and all data
            </p>
          </div>
          <Button variant="destructive" size="sm" disabled>
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}
