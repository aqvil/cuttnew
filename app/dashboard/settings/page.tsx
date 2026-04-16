'use client'

import { useState, useEffect } from "react"
import { updateProfile } from "@/app/actions/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, AtSign, Settings as SettingsIcon, Shield, Activity, User, CreditCard } from "lucide-react"
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
      toast.success("PARAMETERS_COMMITTED")
    } catch (err: any) {
      toast.error(`CRITICAL_FAILURE: ${err.message?.toUpperCase() || "SYNC_ERROR"}`)
    } finally {
      setSaving(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-white/20" />
      </div>
    )
  }

  return (
    <div className="space-y-16 pb-24 max-w-5xl">
      {/* Header Section */}
      <div className="border-b border-white/10 pb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="tech-label mb-4">
              <SettingsIcon className="h-3 w-3" />
              SYSTEM_CONFIGURATION_ACTIVE
            </div>
            <h1 className="text-8xl font-black tracking-tighter uppercase italic leading-[0.8] mb-4">
              SYS_CONFIG
            </h1>
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.4em]">
              NODE_ID: {session?.user?.id?.slice(0, 12).toUpperCase()} // SECURITY_LEVEL: HIGH
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-5 gap-12">
        {/* Core Identity */}
        <div className="lg:col-span-3 space-y-12">
          <div className="card-mono p-10 border-white/20">
            <div className="flex items-center justify-between mb-10 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-white/40" />
                <h2 className="text-sm font-black uppercase italic tracking-widest">ENTITY_IDENTITY</h2>
              </div>
              <span className="text-[8px] font-mono font-bold opacity-20">[01]</span>
            </div>

            <div className="space-y-10">
              <div className="space-y-3">
                <Label htmlFor="display_name" className="text-[10px] font-black uppercase tracking-widest opacity-60">PUBLIC_LABEL</Label>
                <Input
                  id="display_name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="ENTER_NAME"
                  className="border border-white/10 bg-white/5 h-14 px-6 text-[10px] font-mono uppercase tracking-widest rounded-none focus:border-white transition-all"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="username" className="text-[10px] font-black uppercase tracking-widest opacity-60">PATH_IDENTIFIER</Label>
                <div className="relative group">
                  <AtSign className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/20 group-hover:text-white transition-colors" />
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="USERNAME"
                    className="border border-white/10 bg-white/5 h-14 pl-12 text-[10px] font-mono uppercase tracking-widest rounded-none focus:border-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="bio" className="text-[10px] font-black uppercase tracking-widest opacity-60">ENTITY_DESCRIPTOR</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="DEFINE_ENTITY_FUNCTIONS..."
                  rows={4}
                  className="border border-white/10 bg-white/5 px-6 py-4 text-[10px] font-mono uppercase tracking-widest rounded-none focus:border-white transition-all resize-none"
                />
              </div>
            </div>
          </div>

          <div className="card-mono p-10 border-white/10">
            <div className="flex items-center justify-between mb-10 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-white/40" />
                <h2 className="text-sm font-black uppercase italic tracking-widest">ACCESS_PROTOCOL</h2>
              </div>
              <span className="text-[8px] font-mono font-bold opacity-20">[02]</span>
            </div>

            <div className="space-y-6">
               <div className="space-y-3 opacity-40">
                <Label className="text-[10px] font-black uppercase tracking-widest">COMMUNICATION_ADDRESS</Label>
                <Input
                  value={session?.user?.email || ""}
                  disabled
                  className="border border-white/10 bg-black h-14 px-6 text-[10px] font-mono uppercase tracking-widest rounded-none cursor-not-allowed"
                />
              </div>
              <p className="text-[8px] font-mono uppercase tracking-widest opacity-30 italic leading-relaxed">
                ADDRESS_ALTERATION_REQUIRES_SECONDARY_VALIDATION. PLEASE_CONTACT_INFRASTRUCTURE_SUPPORT.
              </p>
            </div>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="lg:col-span-2 space-y-8">
            <div className="card-mono p-10 border-white/10">
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-8 border-b border-white/10 pb-4 opacity-40">
                LOGISTICS_STATUS
              </h3>
              <div className="space-y-8">
                <div className="flex items-center justify-between border border-white/10 bg-black p-6">
                   <div>
                    <div className="text-[8px] font-mono font-bold uppercase opacity-30 mb-1">CURRENT_PLAN</div>
                    <div className="text-2xl font-black italic tracking-tighter">FREE_ACCESS</div>
                   </div>
                   <Button variant="outline" className="btn-ghost-mono px-4 h-10 text-[8px]" asChild>
                    <Link href="/dashboard/billing">UPGRADE</Link>
                   </Button>
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between items-center text-[10px] font-mono tracking-widest">
                    <span className="opacity-40">CORE_STABILITY</span>
                    <span className="font-black text-emerald-400">NOMINAL_99%</span>
                  </div>
                  <div className="h-1 bg-white/5">
                    <div className="h-full bg-white/20 w-[99%]" />
                  </div>
                </div>

                 <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10">
                    <Activity className="h-3 w-3 text-accent" />
                    <span className="text-[8px] font-black uppercase tracking-widest">SYSTEM_OPTIMIZED</span>
                 </div>
              </div>
            </div>

            <div className="space-y-4 pt-12">
               <Button type="submit" disabled={saving} className="btn-mono w-full h-16 text-sm">
                {saving ? (
                   <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    COMMITING_DATA...
                  </>
                ) : (
                  "SYNC_CONFIGURATION"
                )}
              </Button>
              <Button variant="outline" className="btn-ghost-mono w-full h-14" asChild>
                <Link href="/dashboard">RETURN_TO_OVERVIEW</Link>
              </Button>
            </div>
        </div>
      </form>
    </div>
  )
}
