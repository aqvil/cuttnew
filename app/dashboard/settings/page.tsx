'use client'

import { useState, useEffect } from "react"
import { updateProfile } from "@/app/actions/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, AtSign, User, Mail, Link2 } from "lucide-react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

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
      toast.success("Settings saved successfully")
    } catch (err: any) {
      toast.error(`Error saving settings: ${err.message}`)
    } finally {
      setSaving(false)
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
    <div className="space-y-8 pb-12 max-w-4xl mx-auto p-8 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-border">
         <div>
            <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your account settings and preferences.</p>
         </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
         <div className="card overflow-hidden">
            <div className="px-8 flex items-center justify-between border-b border-border bg-slate-50 py-4">
               <div>
                  <h2 className="text-lg font-bold text-slate-900">Profile Details</h2>
               </div>
            </div>
            
            <div className="p-8 space-y-6">
               <div className="space-y-2">
                 <Label htmlFor="display_name" className="text-sm font-semibold text-slate-700">Display Name</Label>
                 <Input
                   id="display_name"
                   value={displayName}
                   onChange={(e) => setDisplayName(e.target.value)}
                   placeholder="e.g. John Doe"
                   className="h-12 border-slate-200 bg-white md:max-w-md"
                 />
                 <p className="text-xs text-slate-500">This is your public display name.</p>
               </div>

               <div className="space-y-2">
                 <Label htmlFor="username" className="text-sm font-semibold text-slate-700">Username</Label>
                 <div className="relative md:max-w-md">
                   <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                   <Input
                     id="username"
                     value={username}
                     onChange={(e) => setUsername(e.target.value)}
                     placeholder="johndoe"
                     className="h-12 pl-10 border-slate-200 bg-white"
                   />
                 </div>
                 <p className="text-xs text-slate-500">This will be used for your public profile URL.</p>
               </div>

               <div className="space-y-2">
                 <Label htmlFor="bio" className="text-sm font-semibold text-slate-700">Bio</Label>
                 <Textarea
                   id="bio"
                   value={bio}
                   onChange={(e) => setBio(e.target.value)}
                   placeholder="Tell us a little bit about yourself"
                   rows={4}
                   className="border-slate-200 bg-white resize-none"
                 />
               </div>
            </div>
         </div>

         <div className="card overflow-hidden">
            <div className="px-8 flex items-center justify-between border-b border-border bg-slate-50 py-4">
               <div>
                  <h2 className="text-lg font-bold text-slate-900">Account Security</h2>
               </div>
            </div>
            
            <div className="p-8 space-y-6">
               <div className="space-y-2">
                 <Label className="text-sm font-semibold text-slate-700">Email Address</Label>
                 <div className="flex gap-4 md:max-w-md">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        value={session?.user?.email || ""}
                        disabled
                        className="h-12 pl-10 border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                      />
                    </div>
                 </div>
                 <p className="text-xs text-slate-500">Contact support to change your email address.</p>
               </div>
               
               <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                     <h3 className="text-sm font-semibold text-slate-900">Connected Accounts</h3>
                     <p className="text-xs text-slate-500">Manage OAuth associations.</p>
                  </div>
                  <Button variant="secondary" disabled>Connect Discord</Button>
               </div>
            </div>
         </div>

         <div className="flex justify-start pt-4">
            <Button type="submit" disabled={saving} className="btn-primary h-12 px-8">
               {saving ? (
                  <>
                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                     Saving...
                  </>
               ) : (
                  "Save changes"
               )}
            </Button>
         </div>
      </form>
    </div>
  )
}
