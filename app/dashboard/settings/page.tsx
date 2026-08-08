'use client'

import { useState, useEffect } from "react"
import { updateProfile } from "@/app/actions/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle2, User, Mail, Shield, Key, Globe, CreditCard, Code, Users } from "lucide-react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const [displayName, setDisplayName] = useState("")
  const [savingName, setSavingName] = useState(false)
  const [language, setLanguage] = useState("Automatic")

  useEffect(() => {
    if (session?.user) {
      setDisplayName(session.user.name || "")
    }
  }, [session])

  const handleUpdateName = async () => {
    setSavingName(true)
    try {
      await updateProfile({ displayName })
      toast.success("Display name updated successfully")
    } catch (err: any) {
      toast.error(`Error updating name: ${err.message}`)
    } finally {
      setSavingName(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 font-mono">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Bitly Left Sub-Navigation Sidebar */}
        <div className="md:col-span-1 space-y-6 text-xs border-r border-border/60 pr-6">
          <div className="space-y-2">
            <div className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Personal settings</div>
            <div className="space-y-1">
              <button className="w-full text-left font-bold text-foreground bg-primary/10 text-primary px-3 py-1.5 rounded-md border border-primary/20">
                Profile
              </button>
              <button className="w-full text-left text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md">
                Integrations
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Account settings</div>
            <div className="space-y-1">
              <button className="w-full text-left text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md">
                Account details
              </button>
              <button className="w-full text-left text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md">
                Billing and usage
              </button>
              <button className="w-full text-left text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md">
                Users & Teams
              </button>
              <button className="w-full text-left text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md">
                Single sign-on
              </button>
              <button className="w-full text-left text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md">
                Mobile deep links
              </button>
              <button className="w-full text-left text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md">
                Webhooks
              </button>
              <button className="w-full text-left text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md">
                Activity log
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Developer settings</div>
            <div className="space-y-1">
              <button className="w-full text-left text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md">
                API Tokens
              </button>
            </div>
          </div>
        </div>

        {/* Right Main Content Area (Attachment 3 Layout) */}
        <div className="md:col-span-3 space-y-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Profile</h1>
            <h2 className="text-sm font-bold text-muted-foreground mt-2 uppercase">Preferences</h2>
          </div>

          {/* Display Name Section */}
          <div className="space-y-3 max-w-lg">
            <Label className="text-xs font-semibold text-foreground">Display name</Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Pilav Twitch"
              className="font-mono text-xs h-10"
            />
            <Button
              onClick={handleUpdateName}
              disabled={savingName}
              variant="outline"
              size="sm"
              className="font-mono text-xs font-bold"
            >
              {savingName ? "Saving..." : "Update display name"}
            </Button>
          </div>

          {/* Language Section */}
          <div className="space-y-3 max-w-lg pt-4 border-t border-border/60">
            <Label className="text-xs font-semibold text-foreground">Language</Label>
            <p className="text-xs text-muted-foreground">
              Cuttly uses your browser's language by default. Select a language below to override this setting.
            </p>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full h-10 rounded-md border border-border bg-background px-3 font-mono text-xs text-foreground focus:outline-none"
            >
              <option value="Automatic">Automatic (Browser Default)</option>
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="German">German</option>
              <option value="French">French</option>
            </select>
            <Button
              onClick={() => toast.success("Language preference updated")}
              variant="outline"
              size="sm"
              className="font-mono text-xs font-bold"
            >
              Update language
            </Button>
          </div>

          {/* Email Addresses Section */}
          <div className="space-y-4 pt-6 border-t border-border/60">
            <h3 className="text-sm font-bold text-foreground">Email addresses</h3>
            <p className="text-xs text-muted-foreground">
              Select or add a new email address to receive notifications. Only verified emails can be designated as the primary address.
            </p>

            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase">
                  <tr>
                    <th className="p-3">Email address</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Primary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr>
                    <td className="p-3 font-semibold">{session?.user?.email || "user@cuttly.local"}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-emerald-500 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    </td>
                    <td className="p-3">
                      <input type="radio" checked readOnly className="accent-primary" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button variant="outline" size="sm" className="font-mono text-xs font-bold text-primary border-primary/30">
                Add new email
              </Button>
              <Button variant="outline" size="sm" disabled className="font-mono text-xs">
                Update primary email
              </Button>
            </div>
          </div>

          {/* Security & Authentication */}
          <div className="pt-6 border-t border-border/60 space-y-3">
            <h3 className="text-sm font-bold text-foreground">Security & authentication</h3>
            <p className="text-xs text-muted-foreground">
              Manage your password and active session credentials.
            </p>
            <Button variant="outline" size="sm" className="font-mono text-xs font-bold">
              Change password
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
