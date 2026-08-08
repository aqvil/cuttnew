'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createTeam, inviteTeamMember, deleteTeam } from "@/app/actions/teams"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Users,
  Plus,
  ShieldCheck,
  UserPlus,
  Trash2,
  Sparkles,
  Building,
  Crown,
  Shield,
  User,
  CheckCircle2,
} from "lucide-react"
import { toast } from "sonner"

interface TeamsClientProps {
  initialTeams: any[]
}

export function TeamsClient({ initialTeams }: TeamsClientProps) {
  const [teams, setTeams] = useState(initialTeams)

  const [isTeamOpen, setIsTeamOpen] = useState(false)
  const [teamName, setTeamName] = useState("")
  const [teamSlug, setTeamSlug] = useState("")
  const [isCreatingTeam, setIsCreatingTeam] = useState(false)

  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member")
  const [isInviting, setIsInviting] = useState(false)

  const router = useRouter()

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamName || !teamSlug) {
      toast.error("Team name and slug are required")
      return
    }

    setIsCreatingTeam(true)
    try {
      const newTeam = await createTeam(teamName, teamSlug)
      setTeams([{ ...newTeam, role: "owner" }, ...teams])
      toast.success("Workspace team created successfully!")
      setIsTeamOpen(false)
      setTeamName("")
      setTeamSlug("")
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Failed to create team")
    } finally {
      setIsCreatingTeam(false)
    }
  }

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeamId || !inviteEmail) {
      toast.error("Please provide an email address")
      return
    }

    setIsInviting(true)
    try {
      await inviteTeamMember(selectedTeamId, inviteEmail, inviteRole)
      toast.success(`Invitation sent to ${inviteEmail}!`)
      setIsInviteOpen(false)
      setInviteEmail("")
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Failed to invite team member")
    } finally {
      setIsInviting(false)
    }
  }

  const handleDeleteTeam = async (teamId: string) => {
    try {
      await deleteTeam(teamId)
      setTeams(teams.filter((t) => t.id !== teamId))
      toast.success("Team deleted")
      router.refresh()
    } catch {
      toast.error("Failed to delete team")
    }
  }

  return (
    <div className="dash-narrow space-y-8">
      {/* Hero Banner */}
      <div className="dash-hero relative overflow-hidden bg-gradient-to-br from-card via-card to-purple-500/5 border border-border p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 text-left">
            <div className="dash-kicker text-purple-500 bg-purple-500/10 border-purple-500/20">
              <Sparkles className="size-3.5" /> Workspace Collaboration
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Teams Management Studio
            </h1>
            <p className="text-sm text-muted-foreground max-w-lg">
              Create up to 10 workspace teams and invite up to 20 team members per team to manage branded short links collaboratively.
            </p>
          </div>

          <Dialog open={isTeamOpen} onOpenChange={setIsTeamOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="btn-primary gap-2 shadow-lg hover:shadow-xl font-semibold">
                <Plus className="size-5" />
                Create New Team
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building className="size-5 text-purple-500" /> Create Workspace Team
                </DialogTitle>
                <DialogDescription>
                  Setup a shared workspace team for your organization (Max 10 teams).
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateTeam} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Team Name</Label>
                  <Input
                    placeholder="e.g. Acme Marketing Team"
                    value={teamName}
                    onChange={(e) => {
                      setTeamName(e.target.value)
                      if (!teamSlug) setTeamSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))
                    }}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Team Slug</Label>
                  <Input
                    placeholder="acme-marketing"
                    value={teamSlug}
                    onChange={(e) => setTeamSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsTeamOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isCreatingTeam} className="btn-primary">Create Team</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="dash-panel p-5 bg-card rounded-xl border border-border">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Users className="size-3.5 text-purple-500" /> Teams Count
          </p>
          <p className="text-3xl font-extrabold text-foreground mt-2">{teams.length} <span className="text-xs text-muted-foreground font-normal">/ 10</span></p>
        </div>
        <div className="dash-panel p-5 bg-card rounded-xl border border-border">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <UserPlus className="size-3.5 text-blue-500" /> Max Members / Team
          </p>
          <p className="text-3xl font-extrabold text-foreground mt-2">20 Members</p>
        </div>
        <div className="dash-panel p-5 bg-card rounded-xl border border-border">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Crown className="size-3.5 text-amber-500" /> Role Permissions
          </p>
          <p className="text-3xl font-extrabold text-foreground mt-2">Owner / Admin</p>
        </div>
        <div className="dash-panel p-5 bg-card rounded-xl border border-border">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-emerald-500" /> Team Links
          </p>
          <p className="text-3xl font-extrabold text-foreground mt-2">Unlimited</p>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Your Workspace Teams</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((t: any) => (
            <div key={t.id} className="group bg-card border border-border hover:border-purple-500/40 rounded-2xl p-6 transition-all shadow-md hover:shadow-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-extrabold text-lg">
                      {t.name?.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-base group-hover:text-purple-500 transition-colors">
                        {t.name}
                      </h3>
                      <p className="text-xs font-mono text-muted-foreground">/{t.slug}</p>
                    </div>
                  </div>

                  {t.role === "owner" && (
                    <button
                      onClick={() => handleDeleteTeam(t.id)}
                      className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-500 capitalize">
                    {t.role === "owner" ? <Crown className="size-3" /> : <Shield className="size-3" />}
                    {t.role}
                  </span>
                  <span className="text-xs text-muted-foreground">1 / 20 Members</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs font-semibold w-full"
                  onClick={() => {
                    setSelectedTeamId(t.id)
                    setIsInviteOpen(true)
                  }}
                >
                  <UserPlus className="size-3.5" /> Invite Member
                </Button>
              </div>
            </div>
          ))}

          {teams.length === 0 && (
            <div className="col-span-full py-16 text-center border-2 border-dashed border-border rounded-2xl bg-card/50">
              <Users className="size-12 text-muted-foreground/40 mx-auto mb-3 animate-float" />
              <h3 className="text-lg font-bold text-foreground">No Teams Created Yet</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Create team workspaces to invite colleagues and share short link management permissions.
              </p>
              <Button onClick={() => setIsTeamOpen(true)} className="btn-primary mt-6 gap-2">
                <Plus className="size-4" /> Create First Team
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Invite Member Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="size-5 text-purple-500" /> Invite Team Member
            </DialogTitle>
            <DialogDescription>
              Add a team member to collaborate (Max 20 members per team).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleInviteMember} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Member Email Address</Label>
              <Input
                type="email"
                placeholder="colleague@acme.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Role & Permissions</Label>
              <select
                value={inviteRole}
                onChange={(e: any) => setInviteRole(e.target.value)}
                className="w-full h-10 px-3 border border-border rounded-md bg-background text-sm text-foreground focus:ring-2 focus:ring-primary"
              >
                <option value="member">Member (Create & Edit Links)</option>
                <option value="admin">Admin (Manage Members & Settings)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isInviting} className="btn-primary">Send Invitation</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
