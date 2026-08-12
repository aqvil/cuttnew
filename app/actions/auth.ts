"use server"

import crypto from "crypto"
import { headers } from "next/headers"
import { and, eq, gt } from "drizzle-orm"
import { z } from "zod"
import { db } from "@/lib/db"
import { profiles, users, verificationTokens } from "@/lib/db/schema"
import { hashPassword } from "@/lib/auth/password"
import { emailLayout, isEmailConfigured, sendEmail } from "@/lib/email"
import { LIMITS, clientIp, hit } from "@/lib/rate-limit"

/**
 * Registration and password reset.
 */

const signUpSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(100),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  password: z
    .string()
    .min(8, "Passwords need at least 8 characters.")
    .max(128, "Passwords can be at most 128 characters."),
})

function makeUsername(name: string, id: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")

  return `${base || "user"}_${id.slice(0, 6)}`
}

export async function registerWithEmail(
  input: unknown
): Promise<{ ok: boolean; error?: string; field?: string }> {
  const ip = clientIp(await headers())
  const limit = hit(`auth:register:${ip}`, LIMITS.register)
  if (!limit.allowed) {
    return { ok: false, error: "Too many sign-up attempts. Please try again later." }
  }

  const parsed = signUpSchema.safeParse(input)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return {
      ok: false,
      error: issue?.message || "Please check the form and try again.",
      field: issue?.path[0]?.toString(),
    }
  }

  const email = parsed.data.email.toLowerCase()

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (existing) {
    return {
      ok: false,
      error: "An account with that email already exists. Try signing in instead.",
      field: "email",
    }
  }

  const id = crypto.randomUUID()
  const password = await hashPassword(parsed.data.password)
  const now = new Date()
  const username = makeUsername(parsed.data.name, id)

  try {
    await db.transaction(async (tx) => {
      await tx.insert(users).values({
        id,
        name: parsed.data.name,
        username,
        email,
        password,
        // Email verification is not enforced on this deployment; recording the
        // timestamp keeps the adapter's expectations satisfied.
        emailVerified: now,
        role: "user",
        createdAt: now,
        updatedAt: now,
      })

      await tx.insert(profiles).values({
        id,
        username,
        displayName: parsed.data.name,
        plan: "free",
        createdAt: now,
        updatedAt: now,
      })
    })
  } catch (err) {
    // A concurrent registration with the same email loses the unique index race.
    if ((err as { code?: string }).code === "23505") {
      return {
        ok: false,
        error: "An account with that email already exists. Try signing in instead.",
        field: "email",
      }
    }
    console.error("[auth] registration failed:", err)
    return { ok: false, error: "We couldn't create your account right now. Please try again." }
  }

  return { ok: true }
}

/* ------------------------------------------------------------------
   Password reset
------------------------------------------------------------------- */

const RESET_TTL_MS = 60 * 60 * 1000 // 1 hour
const RESET_PREFIX = "pwreset:"

function resetIdentifier(email: string) {
  return `${RESET_PREFIX}${email}`
}

/** Tokens are stored hashed so a leak of the table can't reset anyone's password. */
function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex")
}

export interface RequestResetResult {
  ok: boolean
  /** True when no mail transport is configured, so the UI can say so honestly. */
  emailUnavailable?: boolean
  error?: string
}

/**
 * Starts a password reset.
 *
 * Always reports success for a well-formed address. Telling the caller whether
 * an account exists would turn this form into an account-enumeration oracle.
 */
export async function requestPasswordReset(email: string): Promise<RequestResetResult> {
  const ip = clientIp(await headers())
  const limit = hit(`auth:reset:${ip}`, LIMITS.register)
  if (!limit.allowed) {
    return { ok: false, error: "Too many requests. Please try again later." }
  }

  const parsed = z.string().trim().email().max(254).safeParse(email)
  if (!parsed.success) {
    return { ok: false, error: "Enter a valid email address." }
  }

  const normalised = parsed.data.toLowerCase()

  if (!isEmailConfigured()) {
    return {
      ok: false,
      emailUnavailable: true,
      error:
        "Password reset emails aren't enabled on this deployment. Contact support and we'll help you back in.",
    }
  }

  const [user] = await db
    .select({ id: users.id, email: users.email, password: users.password })
    .from(users)
    .where(eq(users.email, normalised))
    .limit(1)

  // Only send when there is a password-based account to reset — but return the
  // same result either way.
  if (user?.password) {
    const token = crypto.randomBytes(32).toString("base64url")
    const expires = new Date(Date.now() + RESET_TTL_MS)

    // Invalidate any outstanding token for this address first.
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.identifier, resetIdentifier(normalised)))

    await db.insert(verificationTokens).values({
      identifier: resetIdentifier(normalised),
      token: hashToken(token),
      expires,
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const resetUrl = `${appUrl}/auth/reset-password?token=${token}&email=${encodeURIComponent(normalised)}`

    await sendEmail({
      to: normalised,
      subject: "Reset your Cuttly password",
      html: emailLayout(
        "Reset your password",
        "<p>We received a request to reset the password on your Cuttly account. This link expires in one hour.</p><p>If you didn't ask for this, you can safely ignore this email — your password won't change.</p>",
        { label: "Choose a new password", url: resetUrl }
      ),
      text: `Reset your Cuttly password\n\nOpen this link within the next hour to choose a new password:\n${resetUrl}\n\nIf you didn't request this, you can ignore this email.`,
    })
  }

  return { ok: true }
}

const resetSchema = z.object({
  email: z.string().trim().email().max(254),
  token: z.string().min(10).max(200),
  password: z
    .string()
    .min(8, "Passwords need at least 8 characters.")
    .max(128, "Passwords can be at most 128 characters."),
})

export async function resetPassword(
  input: unknown
): Promise<{ ok: boolean; error?: string; field?: string }> {
  const ip = clientIp(await headers())
  const limit = hit(`auth:reset-confirm:${ip}`, LIMITS.auth)
  if (!limit.allowed) {
    return { ok: false, error: "Too many attempts. Please try again later." }
  }

  const parsed = resetSchema.safeParse(input)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return {
      ok: false,
      error: issue?.message || "That reset link isn't valid.",
      field: issue?.path[0]?.toString(),
    }
  }

  const email = parsed.data.email.toLowerCase()
  const identifier = resetIdentifier(email)

  const [record] = await db
    .select()
    .from(verificationTokens)
    .where(
      and(
        eq(verificationTokens.identifier, identifier),
        eq(verificationTokens.token, hashToken(parsed.data.token)),
        gt(verificationTokens.expires, new Date())
      )
    )
    .limit(1)

  if (!record) {
    return {
      ok: false,
      error: "This reset link has expired or already been used. Request a new one.",
    }
  }

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (!user) {
    return { ok: false, error: "This reset link is no longer valid." }
  }

  // Update the password and burn the token together — a failure part-way
  // through must not leave a usable token behind.
  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ password: await hashPassword(parsed.data.password), updatedAt: new Date() })
      .where(eq(users.id, user.id))

    await tx
      .delete(verificationTokens)
      .where(eq(verificationTokens.identifier, identifier))
  })

  return { ok: true }
}
