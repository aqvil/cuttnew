"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { profiles, qrCodes, shortLinks } from "@/lib/db/schema"
import { and, count, eq, gte, inArray, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { hashPassword } from "@/lib/auth/password"
import { generateShortCode, validateAlias } from "@/lib/links/shortcode"
import { validateDestinationUrl, validateRedirectTarget } from "@/lib/links/url"
import { planFor } from "@/lib/plans"
import { LIMITS, clientIp, hit } from "@/lib/rate-limit"

/**
 * Server actions for short links.
 *
 * Every action returns a discriminated result instead of throwing. Thrown
 * errors from a server action reach the client as an opaque digest in
 * production, which is exactly the wrong behaviour for validation failures —
 * the user needs to know that their alias was taken, not that "an error
 * occurred".
 */
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; field?: string }

/** Postgres unique-violation SQLSTATE. */
const UNIQUE_VIOLATION = "23505"

function isUniqueViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === UNIQUE_VIOLATION
}

async function requireUser(): Promise<
  { ok: true; userId: string } | { ok: false; error: string }
> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: "Your session has expired. Sign in again to continue." }
  }
  return { ok: true, userId: session.user.id }
}

/** Links created by this user since the start of the current calendar month. */
async function linksThisMonth(userId: string): Promise<number> {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [row] = await db
    .select({ value: count() })
    .from(shortLinks)
    .where(and(eq(shortLinks.userId, userId), gte(shortLinks.createdAt, startOfMonth)))

  return Number(row?.value || 0)
}

export interface LinkQuota {
  used: number
  limit: number | null
  remaining: number | null
  planName: string
}

/** Powers the "N links left this month" hint on the create form. */
export async function getLinkQuota(): Promise<LinkQuota | null> {
  const session = await auth()
  if (!session?.user?.id) return null

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, session.user.id),
    columns: { plan: true },
  })

  const plan = planFor(profile?.plan)
  const used = await linksThisMonth(session.user.id)

  return {
    used,
    limit: plan.linksPerMonth,
    remaining: plan.linksPerMonth === null ? null : Math.max(0, plan.linksPerMonth - used),
    planName: plan.name,
  }
}

/**
 * Checks whether a custom back-half can be used. Deliberately reports only
 * "available" or "taken" — never who owns it.
 */
export async function checkAliasAvailability(
  alias: string
): Promise<{ available: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) return { available: false, error: "Sign in to reserve a custom link." }

  const validation = validateAlias(alias)
  if (!validation.ok) return { available: false, error: validation.error }

  const existing = await db.query.shortLinks.findFirst({
    where: eq(shortLinks.shortCode, validation.alias),
    columns: { id: true },
  })

  return existing
    ? { available: false, error: "That back-half is already taken." }
    : { available: true }
}

export interface CreateLinkInput {
  originalUrl: string
  customAlias?: string | null
  title?: string | null
  tags?: string[]
  password?: string | null
  expiresAt?: string | null
  /** Also create a QR code pointing at the new link. */
  createQrCode?: boolean
}

export interface CreatedLink {
  id: string
  shortCode: string
  originalUrl: string
  title: string | null
}

export async function createLink(
  input: CreateLinkInput
): Promise<ActionResult<CreatedLink>> {
  const user = await requireUser()
  if (!user.ok) return { ok: false, error: user.error }

  // Rate limit before touching the database.
  const limit = hit(`link:create:${user.userId}`, LIMITS.linkCreate)
  if (!limit.allowed) {
    return {
      ok: false,
      error: `You're creating links faster than we allow. Try again in ${limit.resetInSeconds}s.`,
    }
  }

  const urlCheck = validateDestinationUrl(input.originalUrl)
  if (!urlCheck.ok) return { ok: false, error: urlCheck.error, field: "originalUrl" }

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.userId),
    columns: { plan: true },
  })
  const plan = planFor(profile?.plan)

  // Monthly quota.
  if (plan.linksPerMonth !== null) {
    const used = await linksThisMonth(user.userId)
    if (used >= plan.linksPerMonth) {
      return {
        ok: false,
        error: `You've used all ${plan.linksPerMonth} links on the ${plan.name} plan this month. Upgrade for more.`,
      }
    }
  }

  // Custom alias, if supplied.
  let shortCode: string
  if (input.customAlias && input.customAlias.trim()) {
    const aliasCheck = validateAlias(input.customAlias)
    if (!aliasCheck.ok) return { ok: false, error: aliasCheck.error, field: "customAlias" }
    shortCode = aliasCheck.alias
  } else {
    shortCode = generateShortCode()
  }

  const expiresAt = parseExpiry(input.expiresAt)
  if (expiresAt === "invalid") {
    return { ok: false, error: "That expiry date isn't valid.", field: "expiresAt" }
  }

  const hashedPassword = input.password?.trim()
    ? await hashPassword(input.password.trim())
    : null

  const tags = normaliseTags(input.tags)
  const title = normaliseTitle(input.title)

  // Insert, retrying on collision. A generated code collides roughly never,
  // but retrying is cheaper than the alternative of losing the link. A custom
  // alias gets no retry — the user picked it, so the conflict is the answer.
  const maxAttempts = input.customAlias ? 1 : 5

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const [link] = await db
        .insert(shortLinks)
        .values({
          userId: user.userId,
          originalUrl: urlCheck.url,
          shortCode,
          customSlug: input.customAlias?.trim() || null,
          title,
          tags,
          password: hashedPassword,
          expiresAt,
          isActive: true,
          clickCount: 0,
        })
        .returning({
          id: shortLinks.id,
          shortCode: shortLinks.shortCode,
          originalUrl: shortLinks.originalUrl,
          title: shortLinks.title,
        })

      if (input.createQrCode) {
        await db
          .insert(qrCodes)
          .values({ userId: user.userId, linkId: link.id, title })
          .catch((err) => console.error("[links] QR creation failed:", err))
      }

      revalidatePath("/dashboard")
      revalidatePath("/dashboard/links")
      revalidatePath("/dashboard/qr-codes")

      return { ok: true, data: link }
    } catch (err) {
      if (isUniqueViolation(err)) {
        if (input.customAlias) {
          return {
            ok: false,
            error: "That back-half is already taken. Try another.",
            field: "customAlias",
          }
        }
        shortCode = generateShortCode(7 + attempt)
        continue
      }

      console.error("[links] create failed:", err)
      return { ok: false, error: "We couldn't create this link right now. Please try again." }
    }
  }

  return { ok: false, error: "We couldn't reserve a short code. Please try again." }
}

export interface UpdateLinkInput {
  originalUrl?: string
  title?: string | null
  tags?: string[]
  /** `null` removes the password; `undefined` leaves it unchanged. */
  password?: string | null
  expiresAt?: string | null
  expirationUrl?: string | null
  maxClicks?: number | string | null
  iosUrl?: string | null
  androidUrl?: string | null
  isActive?: boolean
  archived?: boolean
}

export async function updateLink(
  id: string,
  input: UpdateLinkInput
): Promise<ActionResult> {
  const user = await requireUser()
  if (!user.ok) return { ok: false, error: user.error }

  // Confirm ownership up front so we can return 'not found' rather than
  // silently updating zero rows.
  const existing = await db.query.shortLinks.findFirst({
    where: and(eq(shortLinks.id, id), eq(shortLinks.userId, user.userId)),
    columns: { id: true },
  })
  if (!existing) {
    return { ok: false, error: "That link no longer exists, or you don't have access to it." }
  }

  const patch: Record<string, unknown> = { updatedAt: new Date() }

  if (input.originalUrl !== undefined) {
    const urlCheck = validateDestinationUrl(input.originalUrl)
    if (!urlCheck.ok) return { ok: false, error: urlCheck.error, field: "originalUrl" }
    patch.originalUrl = urlCheck.url
  }

  for (const [field, label] of [
    ["expirationUrl", "Expiry redirect"],
    ["iosUrl", "iOS destination"],
    ["androidUrl", "Android destination"],
  ] as const) {
    const value = input[field]
    if (value === undefined) continue
    if (value === null || value === "") {
      patch[field] = null
      continue
    }
    const check = validateRedirectTarget(value, label)
    if (!check.ok) return { ok: false, error: check.error, field }
    patch[field] = check.url
  }

  if (input.title !== undefined) patch.title = normaliseTitle(input.title)
  if (input.tags !== undefined) patch.tags = normaliseTags(input.tags)
  if (input.isActive !== undefined) patch.isActive = Boolean(input.isActive)
  if (input.archived !== undefined) patch.archivedAt = input.archived ? new Date() : null

  if (input.expiresAt !== undefined) {
    const expiresAt = parseExpiry(input.expiresAt)
    if (expiresAt === "invalid") {
      return { ok: false, error: "That expiry date isn't valid.", field: "expiresAt" }
    }
    patch.expiresAt = expiresAt
  }

  if (input.maxClicks !== undefined) {
    if (input.maxClicks === null || input.maxClicks === "") {
      patch.maxClicks = null
    } else {
      const parsed = Number(input.maxClicks)
      if (!Number.isInteger(parsed) || parsed < 1) {
        return { ok: false, error: "Click limit must be a whole number of 1 or more.", field: "maxClicks" }
      }
      patch.maxClicks = parsed
    }
  }

  if (input.password !== undefined) {
    patch.password = input.password?.trim()
      ? await hashPassword(input.password.trim())
      : null
  }

  try {
    await db
      .update(shortLinks)
      .set(patch)
      .where(and(eq(shortLinks.id, id), eq(shortLinks.userId, user.userId)))
  } catch (err) {
    console.error("[links] update failed:", err)
    return { ok: false, error: "We couldn't save your changes. Please try again." }
  }

  revalidatePath("/dashboard/links")
  revalidatePath(`/dashboard/links/${id}`)
  return { ok: true, data: undefined }
}

export async function deleteLink(id: string): Promise<ActionResult> {
  const user = await requireUser()
  if (!user.ok) return { ok: false, error: user.error }

  const deleted = await db
    .delete(shortLinks)
    .where(and(eq(shortLinks.id, id), eq(shortLinks.userId, user.userId)))
    .returning({ id: shortLinks.id })

  if (deleted.length === 0) {
    return { ok: false, error: "That link no longer exists, or you don't have access to it." }
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/links")
  revalidatePath("/dashboard/qr-codes")
  return { ok: true, data: undefined }
}

export async function bulkDeleteLinks(ids: string[]): Promise<ActionResult<number>> {
  const user = await requireUser()
  if (!user.ok) return { ok: false, error: user.error }
  if (!Array.isArray(ids) || ids.length === 0) {
    return { ok: false, error: "Select at least one link first." }
  }

  const deleted = await db
    .delete(shortLinks)
    .where(and(inArray(shortLinks.id, ids), eq(shortLinks.userId, user.userId)))
    .returning({ id: shortLinks.id })

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/links")
  revalidatePath("/dashboard/qr-codes")
  return { ok: true, data: deleted.length }
}

export async function bulkSetArchived(
  ids: string[],
  archived: boolean
): Promise<ActionResult<number>> {
  const user = await requireUser()
  if (!user.ok) return { ok: false, error: user.error }
  if (!Array.isArray(ids) || ids.length === 0) {
    return { ok: false, error: "Select at least one link first." }
  }

  const updated = await db
    .update(shortLinks)
    .set({ archivedAt: archived ? new Date() : null, updatedAt: new Date() })
    .where(and(inArray(shortLinks.id, ids), eq(shortLinks.userId, user.userId)))
    .returning({ id: shortLinks.id })

  revalidatePath("/dashboard/links")
  return { ok: true, data: updated.length }
}

/** Adds tags to several links at once, preserving any tags already present. */
export async function bulkAddTags(
  ids: string[],
  tags: string[]
): Promise<ActionResult<number>> {
  const user = await requireUser()
  if (!user.ok) return { ok: false, error: user.error }

  const clean = normaliseTags(tags)
  if (clean.length === 0) return { ok: false, error: "Enter at least one tag." }
  if (!Array.isArray(ids) || ids.length === 0) {
    return { ok: false, error: "Select at least one link first." }
  }

  // Union in SQL so concurrent edits don't clobber each other.
  const updated = await db
    .update(shortLinks)
    .set({
      tags: sql`(
        SELECT COALESCE(array_agg(DISTINCT t), '{}')
        FROM unnest(COALESCE(${shortLinks.tags}, '{}') || ${clean}::text[]) AS t
      )`,
      updatedAt: new Date(),
    })
    .where(and(inArray(shortLinks.id, ids), eq(shortLinks.userId, user.userId)))
    .returning({ id: shortLinks.id })

  revalidatePath("/dashboard/links")
  return { ok: true, data: updated.length }
}

/* ------------------------------------------------------------------
   Anonymous creation from the marketing page
------------------------------------------------------------------- */

/**
 * Lets a visitor try the product without an account. The link is real and
 * works immediately; it simply has no owner, so it can't be managed until the
 * visitor signs up. Rate limited hard by IP because this endpoint is the most
 * abusable surface in the product.
 */
export async function createAnonymousLink(
  originalUrl: string
): Promise<ActionResult<{ shortCode: string }>> {
  const requestHeaders = await headers()
  const ip = clientIp(requestHeaders)

  const limit = hit(`link:anon:${ip}`, LIMITS.anonLinkCreate)
  if (!limit.allowed) {
    return {
      ok: false,
      error: "You've reached the free trial limit. Create an account to keep shortening links.",
    }
  }

  const urlCheck = validateDestinationUrl(originalUrl)
  if (!urlCheck.ok) return { ok: false, error: urlCheck.error, field: "originalUrl" }

  let shortCode = generateShortCode()

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const [link] = await db
        .insert(shortLinks)
        .values({
          userId: null,
          originalUrl: urlCheck.url,
          shortCode,
          isActive: true,
          clickCount: 0,
        })
        .returning({ shortCode: shortLinks.shortCode })

      return { ok: true, data: link }
    } catch (err) {
      if (isUniqueViolation(err)) {
        shortCode = generateShortCode(7 + attempt)
        continue
      }
      console.error("[links] anonymous create failed:", err)
      return { ok: false, error: "We couldn't create this link right now. Please try again." }
    }
  }

  return { ok: false, error: "We couldn't reserve a short code. Please try again." }
}

/* ------------------------------------------------------------------
   Shared normalisation
------------------------------------------------------------------- */

const MAX_TITLE_LENGTH = 200
const MAX_TAG_LENGTH = 32
const MAX_TAGS = 20

function normaliseTitle(title: string | null | undefined): string | null {
  if (!title) return null
  const trimmed = title.trim().slice(0, MAX_TITLE_LENGTH)
  return trimmed || null
}

function normaliseTags(tags: string[] | undefined): string[] {
  if (!Array.isArray(tags)) return []
  const seen = new Set<string>()
  for (const raw of tags) {
    if (typeof raw !== "string") continue
    const tag = raw.trim().slice(0, MAX_TAG_LENGTH)
    if (tag) seen.add(tag)
    if (seen.size >= MAX_TAGS) break
  }
  return Array.from(seen)
}

/** Returns a Date, null (cleared), or the string "invalid". */
function parseExpiry(value: string | null | undefined): Date | null | "invalid" {
  if (value === undefined || value === null || value === "") return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "invalid"
  return date
}
