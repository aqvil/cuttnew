"use server"

import { db } from "@/lib/db"
import { linkAnalytics, shortLinks } from "@/lib/db/schema"
import { eq, sql } from "drizzle-orm"
import { headers } from "next/headers"
import crypto from "crypto"
import { verifyPassword } from "@/lib/auth/password"
import { validateDestinationUrl } from "@/lib/links/url"
import { LIMITS, clientIp, hit, reset } from "@/lib/rate-limit"
import {
  detectBrowser,
  detectCity,
  detectCountry,
  detectDevice,
  detectOs,
} from "@/lib/links/user-agent"

const IP_SALT = process.env.AUTH_SECRET || "cuttly-analytics"

export type UnlockResult =
  | { ok: true; url: string }
  | { ok: false; error: string }

/**
 * Verifies the password on a protected link and returns its destination.
 *
 * Rate limited per IP and per link: without a limit this is a password oracle
 * that can be brute-forced at request speed. Failure messages never
 * distinguish "no such link" from "wrong password", so the endpoint can't be
 * used to enumerate which codes exist.
 */
export async function unlockShortLink(
  code: string,
  passwordAttempt: string
): Promise<UnlockResult> {
  const requestHeaders = await headers()
  const ip = clientIp(requestHeaders)

  const limit = hit(`unlock:${ip}:${code}`, LIMITS.unlock)
  if (!limit.allowed) {
    return {
      ok: false,
      error: `Too many attempts. Try again in ${Math.ceil(limit.resetInSeconds / 60)} minute(s).`,
    }
  }

  const genericFailure = { ok: false, error: "That password isn't correct." } as const

  if (typeof code !== "string" || typeof passwordAttempt !== "string" || !passwordAttempt) {
    return genericFailure
  }

  const link = await db.query.shortLinks.findFirst({
    where: eq(shortLinks.shortCode, code),
  })

  if (!link || !link.isActive || link.archivedAt) return genericFailure

  // A link without a password should never be reachable through this action.
  if (!link.password) return genericFailure

  const isValid = await verifyPassword(passwordAttempt, link.password)
  if (!isValid) return genericFailure

  // Re-check expiry after authentication — the password isn't a bypass.
  const isExpired = link.expiresAt ? new Date(link.expiresAt) <= new Date() : false
  const isCapped = link.maxClicks != null && (link.clickCount || 0) >= link.maxClicks
  if (isExpired || isCapped) {
    return { ok: false, error: "This link has expired and no longer redirects." }
  }

  const destination = validateDestinationUrl(link.originalUrl)
  if (!destination.ok) {
    return { ok: false, error: "This link's destination is no longer valid." }
  }

  // Correct password — forgive the attempts spent getting here.
  reset(`unlock:${ip}:${code}`)

  const userAgent = requestHeaders.get("user-agent") || ""

  await Promise.all([
    db
      .insert(linkAnalytics)
      .values({
        linkId: link.id,
        device: detectDevice(userAgent),
        browser: detectBrowser(userAgent),
        os: detectOs(userAgent),
        country: detectCountry(requestHeaders),
        city: detectCity(requestHeaders),
        referrer: requestHeaders.get("referer"),
        source: "link",
        ipHash: crypto.createHmac("sha256", IP_SALT).update(ip).digest("hex").slice(0, 24),
      })
      .catch((err) => console.error("[unlock] analytics insert failed:", err)),

    db
      .update(shortLinks)
      .set({ clickCount: sql`COALESCE(${shortLinks.clickCount}, 0) + 1` })
      .where(eq(shortLinks.id, link.id))
      .catch((err) => console.error("[unlock] click increment failed:", err)),
  ])

  return { ok: true, url: destination.url }
}
