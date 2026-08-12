'use client'

import { useState, useTransition } from "react"
import { signOut } from "next-auth/react"
import { toast } from "sonner"
import { AlertCircle, Check, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { changePassword, deleteAccount } from "@/app/actions/profile"
import { cn } from "@/lib/utils"

const MIN_PASSWORD_LENGTH = 8

/**
 * Security settings: change password, delete account.
 *
 * Both actions require re-proving identity — a session alone isn't enough to
 * change the password or destroy the account.
 */
export function SecurityForm({
  hasPassword,
  email,
}: {
  hasPassword: boolean
  email: string | null
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<{ message: string; field?: string } | null>(null)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting, startDelete] = useTransition()

  const longEnough = newPassword.length >= MIN_PASSWORD_LENGTH
  const matches = newPassword.length > 0 && newPassword === confirmPassword

  const handlePasswordChange = (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!matches) {
      setError({ message: "Those passwords don't match.", field: "confirm" })
      return
    }

    startTransition(async () => {
      const result = await changePassword({ currentPassword, newPassword })

      if (!result.ok) {
        setError({ message: result.error, field: result.field })
        toast.error(result.error)
        return
      }

      toast.success("Password updated.")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    })
  }

  const handleDelete = () => {
    setDeleteError(null)

    startDelete(async () => {
      const result = await deleteAccount(
        hasPassword ? { password: deleteConfirm } : { email: deleteConfirm }
      )

      if (!result.ok) {
        setDeleteError(result.error)
        return
      }

      toast.success("Your account has been deleted.")
      await signOut({ callbackUrl: "/" })
    })
  }

  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="h2">Password</h2>
          <p className="lede">
            {hasPassword
              ? "Choose a new password. You'll stay signed in on this device."
              : "This account signs in with Discord, so there's no password to change."}
          </p>
        </div>

        {hasPassword ? (
          <form onSubmit={handlePasswordChange} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                autoComplete="current-password"
                required
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                aria-invalid={error?.field === "currentPassword"}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                required
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                aria-invalid={error?.field === "newPassword"}
                aria-describedby="new-password-help"
                className="h-10"
              />
              <p
                id="new-password-help"
                className={cn(
                  "flex items-center gap-1.5 text-xs",
                  longEnough ? "text-success" : "text-muted-foreground"
                )}
              >
                {longEnough ? <Check className="size-3" aria-hidden="true" /> : null}
                At least {MIN_PASSWORD_LENGTH} characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                aria-invalid={confirmPassword.length > 0 && !matches}
                className="h-10"
              />
            </div>

            {error ? (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {error.message}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={isPending || !longEnough || !matches || !currentPassword}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Updating…
                </>
              ) : (
                "Update password"
              )}
            </Button>
          </form>
        ) : null}
      </section>

      <section className="space-y-4 border-t border-border pt-8">
        <div className="space-y-1">
          <h2 className="h2">Sessions</h2>
          <p className="lede">
            Signing out ends this browser&apos;s session. Sessions are JSON web tokens and
            expire on their own after 30 days.
          </p>
        </div>
        <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
          Sign out
        </Button>
      </section>

      <section className="space-y-4 border-t border-border pt-8">
        <div className="space-y-1">
          <h2 className="h2 text-destructive">Delete account</h2>
          <p className="lede">
            Permanently deletes your account, every short link you own, all click history and
            every QR code. Your short links stop resolving immediately. This can&apos;t be
            undone.
          </p>
        </div>

        <AlertDialog
          onOpenChange={(open) => {
            if (!open) {
              setDeleteConfirm("")
              setDeleteError(null)
            }
          }}
        >
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive">
              Delete my account
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account?</AlertDialogTitle>
              <AlertDialogDescription>
                Every link you&apos;ve created will stop working for everyone who has it, and
                all click history will be erased. There is no way to recover this.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-2">
              <Label htmlFor="delete-confirm">
                {hasPassword
                  ? "Enter your password to confirm"
                  : `Type ${email} to confirm`}
              </Label>
              <Input
                id="delete-confirm"
                type={hasPassword ? "password" : "text"}
                value={deleteConfirm}
                onChange={(event) => setDeleteConfirm(event.target.value)}
                autoComplete="off"
                className="h-10"
              />
              {deleteError ? (
                <p role="alert" className="text-sm text-destructive">
                  {deleteError}
                </p>
              ) : null}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Keep my account</AlertDialogCancel>
              {/*
                Not AlertDialogAction: that closes the dialog on click, which
                would discard a validation error before the user could read it.
              */}
              <Button
                variant="destructive"
                disabled={isDeleting || !deleteConfirm}
                onClick={handleDelete}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Deleting…
                  </>
                ) : (
                  "Delete permanently"
                )}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </div>
  )
}
