'use client'

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AlertCircle, Loader2, Plus, Trash2, UserPlus, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { EmptyState } from "@/components/app/empty-state"
import { createTeam, deleteTeam, inviteTeamMember, type TeamSummary } from "@/app/actions/teams"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

export function TeamsClient({
  teams,
  canUseTeams,
  planName,
}: {
  teams: TeamSummary[]
  canUseTeams: boolean
  planName: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [slugTouched, setSlugTouched] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const [inviteTeam, setInviteTeam] = useState<TeamSummary | null>(null)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member")
  const [inviteError, setInviteError] = useState<string | null>(null)

  const [pendingDelete, setPendingDelete] = useState<TeamSummary | null>(null)

  const handleCreate = () => {
    setCreateError(null)
    startTransition(async () => {
      const result = await createTeam(name, slug)
      if (!result.ok) {
        setCreateError(result.error)
        return
      }
      setCreateOpen(false)
      setName("")
      setSlug("")
      setSlugTouched(false)
      toast.success("Team created.")
      router.refresh()
    })
  }

  const handleInvite = () => {
    if (!inviteTeam) return
    setInviteError(null)

    startTransition(async () => {
      const result = await inviteTeamMember(inviteTeam.id, inviteEmail, inviteRole)
      if (!result.ok) {
        setInviteError(result.error)
        return
      }

      setInviteTeam(null)
      setInviteEmail("")
      // Say what actually happened rather than claiming an email was sent.
      toast.success(
        result.data.joinedImmediately
          ? `${inviteEmail} was added to ${inviteTeam.name}.`
          : `${inviteEmail} is saved as pending — they'll join automatically when they create an account with that address.`
      )
      router.refresh()
    })
  }

  if (!canUseTeams) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-border bg-subtle p-4 text-sm">
        <Users className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-medium">Teams aren&apos;t included in the {planName} plan</p>
          <p className="text-muted-foreground">
            Share links and analytics with colleagues on the Business plan.{" "}
            <Link href="/dashboard/billing" className="link-brand font-medium">
              See plans
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", isPending && "opacity-70")}>
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" aria-hidden="true" />
          New team
        </Button>
      </div>

      {teams.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No teams yet"
          description="Create a workspace to share links and analytics with colleagues, with owner, admin and member roles."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" aria-hidden="true" />
              Create your first team
            </Button>
          }
        />
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {teams.map((team) => (
            <li key={team.id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-medium">{team.name}</span>
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                    /{team.slug}
                  </code>
                  <Badge variant="secondary" className="h-5 font-normal capitalize">
                    {team.role}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {team.memberCount} member{team.memberCount === 1 ? "" : "s"} · created{" "}
                  {formatDate(team.createdAt)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInviteTeam(team)
                    setInviteError(null)
                  }}
                >
                  <UserPlus className="size-4" aria-hidden="true" />
                  Invite
                </Button>
                {team.isOwner ? (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => setPendingDelete(team)}
                    aria-label={`Delete team ${team.name}`}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Create team */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create a team</DialogTitle>
            <DialogDescription>
              You&apos;ll be the owner. Invite people once it exists.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Team name</Label>
              <Input
                id="team-name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value)
                  if (!slugTouched) {
                    setSlug(
                      event.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-+|-+$/g, "")
                    )
                  }
                }}
                placeholder="Marketing"
                maxLength={100}
                autoFocus
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-slug">Slug</Label>
              <Input
                id="team-slug"
                value={slug}
                onChange={(event) => {
                  setSlugTouched(true)
                  setSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                }}
                placeholder="marketing"
                maxLength={48}
                className="h-10 font-mono"
              />
            </div>

            {createError ? (
              <p role="alert" className="flex items-start gap-1.5 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                {createError}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isPending || !name.trim()}>
              {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
              Create team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite */}
      <Dialog open={inviteTeam !== null} onOpenChange={(open) => !open && setInviteTeam(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite to {inviteTeam?.name}</DialogTitle>
            <DialogDescription>
              If they already have a Cuttly account they join right away. Otherwise the invite
              stays pending until they sign up with that address.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder="colleague@example.com"
                autoFocus
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select
                value={inviteRole}
                onValueChange={(value) => setInviteRole(value as "admin" | "member")}
              >
                <SelectTrigger id="invite-role" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member — can view and create links</SelectItem>
                  <SelectItem value="admin">Admin — can also invite and remove people</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {inviteError ? (
              <p role="alert" className="flex items-start gap-1.5 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                {inviteError}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteTeam(null)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={isPending || !inviteEmail.trim()}>
              {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
              Send invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete team */}
      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{pendingDelete?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Everyone loses access to this workspace. Links created inside it keep working and
              stay with their creators. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                const target = pendingDelete
                setPendingDelete(null)
                if (!target) return
                startTransition(async () => {
                  const result = await deleteTeam(target.id)
                  if (!result.ok) {
                    toast.error(result.error)
                    return
                  }
                  toast.success("Team deleted.")
                  router.refresh()
                })
              }}
            >
              Delete team
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
