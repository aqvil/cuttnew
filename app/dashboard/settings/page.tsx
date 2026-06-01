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
    <div className="dash-narrow font-sans">
      <div className="dash-hero flex flex-col items-center">
         <div>
            <div className="dash-kicker mb-4">
              <User className="size-3.5" />
              Account
            </div>
            <h1 className="dash-title">Account settings</h1>
            <p className="dash-subtitle">Keep your profile and sign-in details tidy. Link creation stays in the Links workspace.</p>
         </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
         <div className="dash-panel overflow-hidden">
            <div className="dash-panel-header">
               <div>
                  <h2 className="dash-panel-title">Public identity</h2>
               </div>
            </div>
            
            <div className="p-8 space-y-6">
               <div className="space-y-2">
                 <Label htmlFor="display_name" className="text-sm font-semibold text-foreground">Display Name</Label>
                 <Input
                   id="display_name"
                   value={displayName}
                   onChange={(e) => setDisplayName(e.target.value)}
                   placeholder="e.g. John Doe"
                   className="dash-field md:max-w-md"
                 />
                 <p className="text-xs text-muted-foreground">This is your public display name.</p>
               </div>

               <div className="space-y-2">
                 <Label htmlFor="username" className="text-sm font-semibold text-foreground">Username</Label>
                 <div className="relative md:max-w-md">
                   <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                   <Input
                     id="username"
                     value={username}
                     onChange={(e) => setUsername(e.target.value)}
                     placeholder="johndoe"
                     className="dash-field pl-10"
                   />
                 </div>
                 <p className="text-xs text-muted-foreground">This can be used for public profile and bio page URLs.</p>
               </div>

               <div className="space-y-2">
                 <Label htmlFor="bio" className="text-sm font-semibold text-foreground">Bio</Label>
                 <Textarea
                   id="bio"
                   value={bio}
                   onChange={(e) => setBio(e.target.value)}
                   placeholder="Tell us a little bit about yourself"
                   rows={4}
                   className="border-border bg-background resize-none"
                 />
               </div>
            </div>
         </div>

         <div className="dash-panel overflow-hidden">
            <div className="dash-panel-header">
               <div>
                  <h2 className="dash-panel-title">Sign-in access</h2>
               </div>
            </div>
            
            <div className="p-8 space-y-6">
               <div className="space-y-2">
                 <Label className="text-sm font-semibold text-foreground">Email Address</Label>
                 <div className="flex gap-4 md:max-w-md">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        value={session?.user?.email || ""}
                        disabled
                        className="h-12 pl-10 border-border bg-muted text-muted-foreground cursor-not-allowed"
                      />
                    </div>
                 </div>
                 <p className="text-xs text-muted-foreground">Contact support to change your email address.</p>
               </div>
               
               <div className="pt-4 border-t border-border flex items-center justify-between">
                  <div>
                     <h3 className="text-sm font-semibold text-foreground">Connected Accounts</h3>
                     <p className="text-xs text-muted-foreground">Manage OAuth associations.</p>
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
