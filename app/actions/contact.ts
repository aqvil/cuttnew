"use server"

import crypto from "crypto"
import { headers } from "next/headers"
import { z } from "zod"
import { db } from "@/lib/db"
import { contactMessages } from "@/lib/db/schema"
import { LIMITS, clientIp, hit } from "@/lib/rate-limit"

/**
 * Contact form.
 *
 * Abuse posture, in order of importance:
 *
 * 1. Submissions are **stored**, never relayed. The form cannot be used to
 *    send mail to a visitor-supplied address, so it can never become an open
 *    email relay — the single most common way contact forms get abused.
 * 2. A honeypot field that real users never see; bots fill it in.
 * 3. A minimum time-on-form check; bots submit instantly.
 * 4. Per-IP rate limiting.
 * 5. Optional Cloudflare Turnstile, enabled by setting TURNSTILE_SECRET_KEY.
 *    Absent that variable the form still works — it just relies on 1–4.
 *
 * Validation errors are specific about the user's input and silent about
 * everything else; a bot learns nothing from the response.
 */

const IP_SALT = process.env.AUTH_SECRET || "cuttly-contact"

const schema = z.object({
  name: z.string().trim().min(2, "Tell us your name.").max(100),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  subject: z.string().trim().max(150).optional(),
  message: z
    .string()
    .trim()
    .min(20, "Please give us a little more detail (at least 20 characters).")
    .max(5000, "Messages are limited to 5,000 characters."),
})

export type ContactResult =
  | { ok: true }
  | { ok: false; error: string; field?: string }

export interface ContactInput {
  name: string
  email: string
  subject?: string
  message: string
  /** Honeypot — must be empty. */
  company?: string
  /** Client timestamp of when the form was rendered. */
  renderedAt?: number
  turnstileToken?: string
}

/** Minimum time a human plausibly needs to fill the form. */
const MIN_FILL_MS = 3_000

export async function submitContactMessage(input: ContactInput): Promise<ContactResult> {
  const requestHeaders = await headers()
  const ip = clientIp(requestHeaders)

  // Honeypot: respond as if it succeeded so the bot doesn't learn it was caught.
  if (input.company && input.company.trim() !== "") {
    return { ok: true }
  }

  if (
    typeof input.renderedAt === "number" &&
    Date.now() - input.renderedAt < MIN_FILL_MS
  ) {
    return { ok: true }
  }

  const limit = hit(`contact:${ip}`, LIMITS.contact)
  if (!limit.allowed) {
    return {
      ok: false,
      error: "You've sent us a few messages already. We'll be in touch — try again later.",
    }
  }

  const parsed = schema.safeParse({
    name: input.name,
    email: input.email,
    subject: input.subject,
    message: input.message,
  })

  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return {
      ok: false,
      error: issue?.message || "Please check the form and try again.",
      field: issue?.path[0]?.toString(),
    }
  }

  const turnstile = await verifyTurnstile(input.turnstileToken, ip)
  if (!turnstile.ok) return turnstile

  try {
    await db.insert(contactMessages).values({
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      subject: parsed.data.subject || null,
      message: parsed.data.message,
      ipHash: crypto.createHmac("sha256", IP_SALT).update(ip).digest("hex").slice(0, 24),
      userAgent: requestHeaders.get("user-agent")?.slice(0, 300) || null,
      status: "new",
    })
  } catch (err) {
    console.error("[contact] insert failed:", err)
    return { ok: false, error: "We couldn't send your message right now. Please try again." }
  }

  return { ok: true }
}

/**
 * Verifies a Turnstile token when the integration is configured. Returns ok
 * when it isn't — the feature is opt-in and the form must not break without it.
 */
async function verifyTurnstile(
  token: string | undefined,
  ip: string
): Promise<ContactResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return { ok: true }

  if (!token) {
    return { ok: false, error: "Please complete the verification challenge." }
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, response: token, remoteip: ip }),
        signal: AbortSignal.timeout(5_000),
      }
    )

    const result = (await response.json()) as { success?: boolean }
    if (!result.success) {
      return { ok: false, error: "Verification failed. Please try the challenge again." }
    }
  } catch (err) {
    // A verification outage must not silently disable the protection, but it
    // also must not lock out every legitimate visitor. Fail closed with a
    // retryable message.
    console.error("[contact] turnstile verification error:", err)
    return { ok: false, error: "We couldn't verify your submission. Please try again." }
  }

  return { ok: true }
}
