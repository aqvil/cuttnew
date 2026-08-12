'use client'

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AlertTriangle, KeyRound, Loader2, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { CopyButton } from "@/components/app/copy-button"
import { createApiKey, revokeApiKey, type ApiKeySummary } from "@/app/actions/api-keys"
import { formatDate, formatRelative } from "@/lib/format"

/**
 * API key management.
 *
 * The plaintext key is displayed exactly once, in a dialog that says so
 * plainly. Only a hash is stored, so there is genuinely no way to show it
 * again — the UI has to be honest about that rather than implying it can be
 * retrieved later.
 */
export function ApiKeysManager({
  keys,
  canCreate,
  planName,
  maxKeys,
}: {
  keys: ApiKeySummary[]
  canCreate: boolean
  planName: string
  maxKeys: number
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [revealed, setRevealed] = useState<string | null>(null)
  const [pendingRevoke, setPendingRevoke] = useState<ApiKeySummary | null>(null)

  const handleCreate = () => {
    setError(null)

    startTransition(async () => {
      const result = await createApiKey(name)

      if (!result.ok) {
        setError(result.error)
        return
      }

      setCreateOpen(false)
      setName("")
      setRevealed(result.data.plaintext)
      router.refresh()
    })
  }

  const handleRevoke = (key: ApiKeySummary) => {
    startTransition(async () => {
      const result = await revokeApiKey(key.id)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(`Key “${key.name}” revoked.`)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="h2">API keys</h2>
          <p className="lede">
            Authenticate REST API requests with{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              Authorization: Bearer ck_…
            </code>
          </p>
        </div>

        {canCreate ? (
          <Button onClick={() => setCreateOpen(true)} disabled={keys.length >= maxKeys}>
            <Plus className="size-4" aria-hidden="true" />
            New key
          </Button>
        ) : null}
      </div>

      {!canCreate ? (
        <div className="flex items-start gap-3 rounded-lg border border-border bg-subtle p-4 text-sm">
          <KeyRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-medium">API access isn&apos;t included in the {planName} plan</p>
            <p className="text-muted-foreground">
              Upgrade to Pro to create keys and use the REST API.{" "}
              <Link href="/dashboard/billing" className="link-brand font-medium">
                See plans
              </Link>
            </p>
          </div>
        </div>
      ) : keys.length === 0 ? (
        <EmptyState
          icon={KeyRound}
          title="No API keys yet"
          description="Create a key to manage links programmatically. Keys inherit your account's plan limits."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" aria-hidden="true" />
              Create your first key
            </Button>
          }
        />
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {keys.map((key) => (
            <li key={key.id} className="flex items-center gap-4 p-4">
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="truncate text-sm font-medium">{key.name}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {key.prefix}
                  <span aria-hidden="true">••••••••••••</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Created {formatDate(key.createdAt)} ·{" "}
                  {key.lastUsedAt ? `last used ${formatRelative(key.lastUsedAt)}` : "never used"}
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => setPendingRevoke(key)}
                aria-label={`Revoke key ${key.name}`}
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {canCreate ? (
        <p className="text-xs text-muted-foreground">
          {keys.length} of {maxKeys} active key{maxKeys === 1 ? "" : "s"} on the {planName} plan.
        </p>
      ) : null}

      {/* Create */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Create an API key</DialogTitle>
            <DialogDescription>
              Name it after where you&apos;ll use it, so you know what to revoke later.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="key-name">Key name</Label>
            <Input
              id="key-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Production server"
              maxLength={60}
              autoFocus
            />
            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isPending || !name.trim()}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Creating…
                </>
              ) : (
                "Create key"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reveal — the only time the plaintext exists in the UI. */}
      <Dialog open={revealed !== null} onOpenChange={(open) => !open && setRevealed(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Copy your API key now</DialogTitle>
            <DialogDescription>
              This is the only time it will be shown. We store only a hash, so we can&apos;t
              show it to you again — if you lose it, revoke the key and create a new one.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-start gap-3 rounded-md border border-warning/30 bg-warning/10 p-3 text-sm">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
            <p>Treat this like a password. Anyone with it can manage your links.</p>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-border bg-subtle p-3">
            <code className="min-w-0 flex-1 break-all font-mono text-xs">{revealed}</code>
            <CopyButton
              value={revealed ?? ""}
              successMessage="API key copied"
              className="shrink-0"
            />
          </div>

          <DialogFooter>
            <Button onClick={() => setRevealed(null)}>I&apos;ve saved it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke */}
      <AlertDialog
        open={pendingRevoke !== null}
        onOpenChange={(open) => !open && setPendingRevoke(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke “{pendingRevoke?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Any application using this key will start getting 401 responses immediately.
              This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                const target = pendingRevoke
                setPendingRevoke(null)
                if (target) handleRevoke(target)
              }}
            >
              Revoke key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
