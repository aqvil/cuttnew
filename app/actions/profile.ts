"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { profiles, users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { hashPassword, verifyPassword } from "@/lib/auth/password"
import type { ActionResult } from "./links"

/**
 * Profile, security and notification settings.
 *
 * The previous `updateProfile` accepted `any` and wrote whatever it was given,
 * including `username`, with no validation — a caller could set an empty or
 * colliding username, or blank out their display name by omitting it.
 */

const profileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Enter a display name.")
    .max(80, "Display names can be at most 80 characters."),
  username: z
    .string()
    .trim()
    .min(3, "Usernames need at least 3 characters.")
    .max(40, "Usernames can be at most 40 characters.")
    .regex(
      /^[a-z0-9_]+$/,
      "Usernames can contain lowercase letters, numbers and underscores only."
    )
    .optional(),
  bio: z.string().trim().max(280, "Bios are limited to 280 characters.").optional(),
})

export async function updateProfile(input: unknown): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: "Your session has expired. Sign in again to continue." }
  }

  const parsed = profileSchema.safeParse(input)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return {
      ok: false,
      error: issue?.message || "Please check the form and try again.",
      field: issue?.path[0]?.toString(),
    }
  }

  const patch: Record<string, unknown> = {
    displayName: parsed.data.displayName,
    updatedAt: new Date(),
  }
  if (parsed.data.username !== undefined) patch.username = parsed.data.username
  if (parsed.data.bio !== undefined) patch.bio = parsed.data.bio || null

  try {
    await db.transaction(async (tx) => {
      await tx.update(profiles).set(patch).where(eq(profiles.id, session.user!.id!))
      // Keep the auth user record in step so the session name stays accurate.
      await tx
        .update(users)
        .set({ name: parsed.data.displayName, updatedAt: new Date() })
        .where(eq(users.id, session.user!.id!))
    })
  } catch (err) {
    if ((err as { code?: string }).code === "23505") {
      return { ok: false, error: "That username is already taken.", field: "username" }
    }
    console.error("[profile] update failed:", err)
    return { ok: false, error: "We couldn't save your profile. Please try again." }
  }

  revalidatePath("/dashboard/settings")
  revalidatePath("/dashboard")
  return { ok: true, data: undefined }
}

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password."),
  newPassword: z
    .string()
    .min(8, "New passwords need at least 8 characters.")
    .max(128, "Passwords can be at most 128 characters."),
})

/**
 * Changes the account password.
 *
 * The current password is always required, even though the user is already
 * authenticated: a session that has been hijacked must not be enough to lock
 * the real owner out.
 */
export async function changePassword(input: unknown): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: "Your session has expired. Sign in again to continue." }
  }

  const parsed = passwordSchema.safeParse(input)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return {
      ok: false,
      error: issue?.message || "Please check the form and try again.",
      field: issue?.path[0]?.toString(),
    }
  }

  const [user] = await db
    .select({ id: users.id, password: users.password })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  if (!user) {
    return { ok: false, error: "We couldn't find your account." }
  }

  if (!user.password) {
    return {
      ok: false,
      error: "This account signs in with Discord and doesn't have a password to change.",
    }
  }

  const valid = await verifyPassword(parsed.data.currentPassword, user.password)
  if (!valid) {
    return { ok: false, error: "That current password isn't correct.", field: "currentPassword" }
  }

  if (parsed.data.currentPassword === parsed.data.newPassword) {
    return {
      ok: false,
      error: "Choose a password different from your current one.",
      field: "newPassword",
    }
  }

  await db
    .update(users)
    .set({ password: await hashPassword(parsed.data.newPassword), updatedAt: new Date() })
    .where(eq(users.id, session.user.id))

  return { ok: true, data: undefined }
}

export async function updateNotificationPreferences(input: {
  productEmails: boolean
  marketingEmails: boolean
}): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: "Your session has expired. Sign in again to continue." }
  }

  await db
    .update(profiles)
    .set({
      productEmails: Boolean(input.productEmails),
      marketingEmails: Boolean(input.marketingEmails),
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, session.user.id))

  revalidatePath("/dashboard/settings/notifications")
  return { ok: true, data: undefined }
}

/**
 * Permanently deletes the account and everything it owns.
 *
 * Requires the password (or, for OAuth accounts, typing the email) so a single
 * stray click can't destroy someone's data. Cascading foreign keys remove
 * links, analytics, QR codes and API keys.
 */
export async function deleteAccount(confirmation: {
  password?: string
  email?: string
}): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: "Your session has expired. Sign in again to continue." }
  }

  const [user] = await db
    .select({ id: users.id, email: users.email, password: users.password })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  if (!user) return { ok: false, error: "We couldn't find your account." }

  if (user.password) {
    const valid = await verifyPassword(confirmation.password || "", user.password)
    if (!valid) {
      return { ok: false, error: "That password isn't correct.", field: "password" }
    }
  } else {
    const typed = (confirmation.email || "").trim().toLowerCase()
    if (!user.email || typed !== user.email.toLowerCase()) {
      return {
        ok: false,
        error: "Type your email address exactly to confirm.",
        field: "email",
      }
    }
  }

  await db.delete(users).where(eq(users.id, session.user.id))
  return { ok: true, data: undefined }
}
