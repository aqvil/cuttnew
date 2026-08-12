"use server"

import { promises as dns } from "dns"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { customDomains, globalTrackingHeaders, profiles } from "@/lib/db/schema"
import { and, count, desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { planFor } from "@/lib/plans"
import type { ActionResult } from "./links"

/**
 * Custom domains.
 *
 * A connected domain is only useful once DNS actually points at this
 * application, so ownership is verified for real: the user adds a TXT record
 * and we resolve it. Previously every domain was inserted with
 * `status: "active"` and `verifiedAt: now()`, which told the user their domain
 * was live when nothing had been checked.
 */

/** Hostname labels, at least one dot, no scheme or path. */
const HOSTNAME = /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/

/** The TXT record name we look for, prefixed to the user's domain. */
const VERIFICATION_HOST = "_cuttly-verify"

/**
 * Deterministic per-domain token. Derived rather than stored so it survives a
 * row being recreated, and it is scoped to the owner so one user can't verify
 * a domain another user is claiming.
 */
export async function verificationToken(domain: string, userId: string): Promise<string> {
  const { createHmac } = await import("crypto")
  return createHmac("sha256", process.env.AUTH_SECRET || "cuttly")
    .update(`${userId}:${domain}`)
    .digest("hex")
    .slice(0, 32)
}

function normaliseDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/\.$/, "")
}

export async function getCustomDomains() {
  const session = await auth()
  if (!session?.user?.id) return []

  try {
    return await db
      .select({
        id: customDomains.id,
        domain: customDomains.domain,
        status: customDomains.status,
        verifiedAt: customDomains.verifiedAt,
        createdAt: customDomains.createdAt,
      })
      .from(customDomains)
      .where(eq(customDomains.userId, session.user.id))
      .orderBy(desc(customDomains.createdAt))
  } catch (err) {
    console.error("[domains] list failed:", err)
    return []
  }
}

export async function addCustomDomain(
  domainName: string
): Promise<ActionResult<{ id: string; domain: string; token: string }>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: "Your session has expired. Sign in again to continue." }
  }

  const domain = normaliseDomain(domainName)

  if (!HOSTNAME.test(domain) || domain.length > 253) {
    return { ok: false, error: "Enter a valid domain, for example links.yourbrand.com" }
  }

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, session.user.id),
    columns: { plan: true },
  })
  const plan = planFor(profile?.plan)

  if (plan.customDomains === 0) {
    return {
      ok: false,
      error: `Custom domains aren't included in the ${plan.name} plan. Upgrade to Pro to connect one.`,
    }
  }

  const [existing] = await db
    .select({ value: count() })
    .from(customDomains)
    .where(eq(customDomains.userId, session.user.id))

  if (Number(existing?.value || 0) >= plan.customDomains) {
    return {
      ok: false,
      error: `The ${plan.name} plan allows ${plan.customDomains} custom domain${plan.customDomains === 1 ? "" : "s"}.`,
    }
  }

  try {
    const [created] = await db
      .insert(customDomains)
      .values({
        userId: session.user.id,
        domain,
        // Not verified until DNS says so.
        status: "pending",
        verifiedAt: null,
        trackingHeaders: [],
      })
      .returning({ id: customDomains.id, domain: customDomains.domain })

    revalidatePath("/dashboard/domains")
    return {
      ok: true,
      data: {
        ...created,
        token: await verificationToken(domain, session.user.id),
      },
    }
  } catch (err) {
    if ((err as { code?: string }).code === "23505") {
      return { ok: false, error: "That domain is already connected to an account." }
    }
    console.error("[domains] add failed:", err)
    return { ok: false, error: "We couldn't add that domain right now. Please try again." }
  }
}

/**
 * Checks the TXT record and flips the domain to verified when it matches.
 *
 * DNS failures are reported specifically — "no record found yet" and "a record
 * exists but doesn't match" need very different fixes from the user, and
 * collapsing them into one message is what makes DNS setup miserable.
 */
export async function verifyCustomDomain(id: string): Promise<ActionResult<{ status: string }>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: "Your session has expired. Sign in again to continue." }
  }

  const [domain] = await db
    .select({ id: customDomains.id, domain: customDomains.domain })
    .from(customDomains)
    .where(and(eq(customDomains.id, id), eq(customDomains.userId, session.user.id)))
    .limit(1)

  if (!domain) {
    return { ok: false, error: "That domain isn't connected to your account." }
  }

  const expected = await verificationToken(domain.domain, session.user.id)
  const recordName = `${VERIFICATION_HOST}.${domain.domain}`

  let records: string[][]
  try {
    records = await dns.resolveTxt(recordName)
  } catch (err) {
    const code = (err as { code?: string }).code
    if (code === "ENOTFOUND" || code === "ENODATA") {
      return {
        ok: false,
        error: `No TXT record found at ${recordName} yet. DNS changes can take up to an hour to propagate — try again shortly.`,
      }
    }
    console.error("[domains] DNS lookup failed:", err)
    return {
      ok: false,
      error: "We couldn't reach DNS to check that record. Please try again in a moment.",
    }
  }

  // resolveTxt returns each record as an array of string chunks.
  const values = records.map((chunks) => chunks.join("").trim())

  if (!values.includes(expected)) {
    return {
      ok: false,
      error: `A TXT record exists at ${recordName} but its value doesn't match. Check for a stray space or an old record left in place.`,
    }
  }

  await db
    .update(customDomains)
    .set({ status: "active", verifiedAt: new Date() })
    .where(eq(customDomains.id, domain.id))

  revalidatePath("/dashboard/domains")
  return { ok: true, data: { status: "active" } }
}

export async function deleteCustomDomain(id: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: "Your session has expired. Sign in again to continue." }
  }

  const deleted = await db
    .delete(customDomains)
    .where(and(eq(customDomains.id, id), eq(customDomains.userId, session.user.id)))
    .returning({ id: customDomains.id })

  if (deleted.length === 0) {
    return { ok: false, error: "That domain isn't connected to your account." }
  }

  revalidatePath("/dashboard/domains")
  return { ok: true, data: undefined }
}

/* ------------------------------------------------------------------
   Global tracking headers
------------------------------------------------------------------- */

export async function getGlobalTrackingHeaders() {
  const session = await auth()
  if (!session?.user?.id) return []

  try {
    return await db
      .select({
        id: globalTrackingHeaders.id,
        name: globalTrackingHeaders.name,
        isActive: globalTrackingHeaders.isActive,
        createdAt: globalTrackingHeaders.createdAt,
      })
      .from(globalTrackingHeaders)
      .where(eq(globalTrackingHeaders.userId, session.user.id))
      .orderBy(desc(globalTrackingHeaders.createdAt))
  } catch (err) {
    console.error("[domains] tracking headers query failed:", err)
    return []
  }
}

const MAX_HEADERS = 15

export async function addGlobalTrackingHeader(
  name: string,
  script: string
): Promise<ActionResult<{ id: string }>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: "Your session has expired. Sign in again to continue." }
  }

  const trimmedName = (name || "").trim()
  const trimmedScript = (script || "").trim()

  if (!trimmedName) return { ok: false, error: "Give this script a name." }
  if (trimmedName.length > 80) return { ok: false, error: "Names can be at most 80 characters." }
  if (!trimmedScript) return { ok: false, error: "Paste the script to inject." }
  if (trimmedScript.length > 10_000) {
    return { ok: false, error: "Scripts are limited to 10,000 characters." }
  }

  const [existing] = await db
    .select({ value: count() })
    .from(globalTrackingHeaders)
    .where(eq(globalTrackingHeaders.userId, session.user.id))

  if (Number(existing?.value || 0) >= MAX_HEADERS) {
    return { ok: false, error: `You can store at most ${MAX_HEADERS} tracking scripts.` }
  }

  const [created] = await db
    .insert(globalTrackingHeaders)
    .values({
      userId: session.user.id,
      name: trimmedName,
      script: trimmedScript,
      isActive: true,
    })
    .returning({ id: globalTrackingHeaders.id })

  revalidatePath("/dashboard/domains")
  return { ok: true, data: created }
}

export async function deleteGlobalTrackingHeader(id: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: "Your session has expired. Sign in again to continue." }
  }

  const deleted = await db
    .delete(globalTrackingHeaders)
    .where(
      and(eq(globalTrackingHeaders.id, id), eq(globalTrackingHeaders.userId, session.user.id))
    )
    .returning({ id: globalTrackingHeaders.id })

  if (deleted.length === 0) {
    return { ok: false, error: "That script no longer exists." }
  }

  revalidatePath("/dashboard/domains")
  return { ok: true, data: undefined }
}
