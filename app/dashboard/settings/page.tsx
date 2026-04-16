'use client'

import { useState, useEffect } from "react"
import { updateProfile } from "@/app/actions/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, AtSign, Settings as SettingsIcon } from "lucide-react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import Link from "next/link"

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const [displayName, setDisplayName] = useState("")
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [saving, setSaving] = useState(false)
  
  useEffect(() => {
    if (session?.user) {
      setDisplayName(session.user.name || "")
      // Mock loading remaining profile data or fetch via action
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)

    try {
      await updateProfile({
        displayName,
        username,
        bio,
      })
      toast.success("Configuration updated")
    } catch (err: any) {
      toast.error(`ERROR: ${err.message?.toUpperCase() || "UPDATE_FAILED"}`)
    } finally {
      setSaving(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <div className="border-b-2 border-primary pb-6">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Settings</h1>
        <p className="mt-2 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
          System Configuration // Node: {session?.user?.id?.slice(0, 8).toUpperCase()}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10 max-w-2xl">
        {/* Profile Section */}
        <div className="card-mono">
          <div className="mb-8 border-b-2 border-primary pb-4">
            <h2 className="text-xl font-black uppercase italic tracking-tight">Profile Data</h2>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">
              Public entity identifiers
            </p>
          </div>
          <div className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="display_name" className="text-[10px] font-black uppercase tracking-widest">
                Display Name
              </Label>
              <Input
                id="display_name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="ENTITY_NAME"
                className="border-2 border-primary bg-background font-bold h-12 uppercase"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-[10px] font-black uppercase tracking-widest">
                Username
              </Label>
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-primary" />
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="USERNAME"
                  className="border-2 border-primary bg-background font-bold h-12 pl-10 uppercase"
                />
              </div>
              <p className="text-[8px] font-mono uppercase tracking-widest opacity-50 mt-2">
                PATH_ID FOR PUBLIC PROFILE SEGMENTS
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-[10px] font-black uppercase tracking-widest">
                Bio Data
              </Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="DESCRIBE_ENTITY_FUNCTIONS..."
                rows={3}
                className="border-2 border-primary bg-background font-bold rounded-none uppercase"
              />
            </div>
          </div>
        </div>

        {/* Email Section */}
        <div className="card-mono opacity-50">
          <div className="mb-6 border-b-2 border-primary pb-4">
            <h2 className="text-lg font-black uppercase italic tracking-tight">Primary Communication</h2>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">
              System access address
            </p>
          </div>
          <Input
            type="email"
            value={session?.user?.email || ""}
            disabled
            className="border-2 border-primary bg-muted/20 font-bold h-12 uppercase"
          />
          <p className="mt-4 text-[8px] font-mono uppercase tracking-widest">
            CONTACT_OPERATIONS TO ALTER COMMUNICATION_NODE
          </p>
        </div>

        {/* Subscription Section */}
        <div className="card-mono">
          <div className="mb-6 border-b-2 border-primary pb-4">
            <h2 className="text-lg font-black uppercase italic tracking-tight">Logistics Plan</h2>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">
              Current throughput allocation
            </p>
          </div>
          <div className="flex items-center justify-between border-4 border-primary p-6 bg-muted/10">
            <div>
              <p className="text-2xl font-black uppercase italic tracking-tighter">FREE_ACCESS</p>
              <p className="text-[10px] font-mono uppercase tracking-widest opacity-60 mt-1">
                BASELINE_OPERATIONAL_CAPACITY
              </p>
            </div>
            <Button variant="outline" size="sm" className="btn-mono" asChild>
              <Link href="/dashboard/billing">MANAGE_PLAN</Link>
            </Button>
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <Button type="submit" disabled={saving} className="btn-mono h-14 px-12 text-lg">
            {saving ? (
              <>
                <Loader2 className="mr-3 size-5 animate-spin" />
                UPDATING...
              </>
            ) : (
              "SYNC_CHANGES"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
