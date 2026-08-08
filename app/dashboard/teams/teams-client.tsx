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
  UserPlus,
  Trash2,
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
      toast.success("Team created")
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
      toast.error("Please enter an email address")
      return
    }

    setIsInviting(true)
    try {
      await inviteTeamMember(selectedTeamId, inviteEmail, inviteRole)
      toast.success(`Invitation sent to ${inviteEmail}`)
      setIsInviteOpen(false)
      setInviteEmail("")
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Failed to invite member")
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
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="dash-kicker mb-2">Workspace Teams</div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Team Workspaces & Roles
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl font-mono">
            Create up to 10 workspace teams and invite up to 20 members per team to collaborate on short links.
          </p>
        </div>

        <Dialog open={isTeamOpen} onOpenChange={setIsTeamOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-10 px-4 bg-foreground text-background font-semibold text-xs rounded-md hover:opacity-90 transition-opacity gap-2">
              <Plus className="size-3.5" />
              New Team
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md border border-border bg-card">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground">Create Workspace Team</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Setup a shared workspace team (Max 10 teams).
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateTeam} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Team Name</Label>
                <Input
                  placeholder="e.g. Marketing Team"
                  value={teamName}
                  onChange={(e) => {
                    setTeamName(e.target.value)
                    if (!teamSlug) setTeamSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))
                  }}
                  className="dash-field h-10 text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Slug</Label>
                <Input
                  placeholder="marketing"
                  value={teamSlug}
                  onChange={(e) => setTeamSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                  className="dash-field h-10 text-xs font-mono"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsTeamOpen(false)} className="h-9 text-xs">Cancel</Button>
                <Button type="submit" disabled={isCreatingTeam} size="sm" className="h-9 text-xs bg-foreground text-background font-semibold">Create Team</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Monochrome Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="border border-border bg-card p-4 rounded-md space-y-1">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Active Teams</p>
          <p className="text-2xl font-bold font-mono text-foreground">{teams.length} <span className="text-xs text-muted-foreground font-normal">/ 10</span></p>
        </div>
        <div className="border border-border bg-card p-4 rounded-md space-y-1">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Capacity / Team</p>
          <p className="text-2xl font-bold font-mono text-foreground">20 Members</p>
        </div>
        <div className="border border-border bg-card p-4 rounded-md space-y-1">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Team Short Links</p>
          <p className="text-2xl font-bold font-mono text-foreground">Unlimited</p>
        </div>
        <div className="border border-border bg-card p-4 rounded-md space-y-1">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Role Model</p>
          <p className="text-xs font-mono font-semibold text-foreground mt-2">Owner / Admin / Member</p>
        </div>
      </div>

      {/* Teams List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-muted-foreground uppercase px-1">
          <span>Workspace Teams ({teams.length})</span>
          <span>Members</span>
        </div>

        <div className="space-y-2">
          {teams.map((t: any) => (
            <div
              key={t.id}
              className="group border border-border bg-card rounded-md p-4 transition-all duration-150 hover:border-foreground/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground text-sm truncate">{t.name}</h3>
                  <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">/{t.slug}</span>
                  <span className="text-[10px] font-mono uppercase bg-muted text-foreground px-2 py-0.5 rounded border border-border font-bold">
                    {t.role}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 justify-between sm:justify-end">
                <span className="text-xs font-mono text-muted-foreground">1 / 20 Members</span>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs font-mono gap-1.5"
                  onClick={() => {
                    setSelectedTeamId(t.id)
                    setIsInviteOpen(true)
                  }}
                >
                  <UserPlus className="size-3" /> Invite
                </Button>

                {t.role === "owner" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteTeam(t.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          {teams.length === 0 && (
            <div className="py-16 text-center border border-dashed border-border rounded-md bg-card">
              <Users className="size-8 text-muted-foreground/40 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-foreground font-mono">No teams created</h3>
              <p className="text-xs text-muted-foreground mt-1 font-mono">Create a team workspace to invite collaborators.</p>
              <Button onClick={() => setIsTeamOpen(true)} size="sm" className="mt-4 h-9 px-4 text-xs font-semibold bg-foreground text-background">
                <Plus className="mr-1.5 size-3.5" /> Create Team
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Invite Member Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-md border border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">Invite Team Member</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add a team member to collaborate (Max 20 members).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleInviteMember} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Member Email Address</Label>
              <Input
                type="email"
                placeholder="colleague@acme.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="dash-field h-10 text-xs font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Role</Label>
              <select
                value={inviteRole}
                onChange={(e: any) => setInviteRole(e.target.value)}
                className="w-full h-10 px-3 border border-border rounded-md bg-background text-xs font-mono text-foreground"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsInviteOpen(false)} className="h-9 text-xs">Cancel</Button>
              <Button type="submit" disabled={isInviting} size="sm" className="h-9 text-xs bg-foreground text-background font-semibold">Send Invitation</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
