import { db } from "@/lib/db"
import { shortLinks } from "@/lib/db/schema"
import { and, count, desc, eq, gte, isNull } from "drizzle-orm"
import { apiError, apiOk, readJson, withApiAuth } from "@/lib/api/respond"
import { generateShortCode, validateAlias } from "@/lib/links/shortcode"
import { validateDestinationUrl } from "@/lib/links/url"
import { planFor } from "@/lib/plans"

/**
 * GET  /api/v1/links — list the authenticated account's links
 * POST /api/v1/links — create a link
 *
 * Both endpoints were previously unauthenticated: GET returned every link
 * belonging to every user on the platform, and POST let anonymous callers
 * write rows. They are now scoped to the API key's owner.
 */

const MAX_LIMIT = 100
const DEFAULT_LIMIT = 25

/** Fields safe to expose. Password hashes and internal ids stay server-side. */
const publicColumns = {
  id: shortLinks.id,
  shortCode: shortLinks.shortCode,
  originalUrl: shortLinks.originalUrl,
  title: shortLinks.title,
  tags: shortLinks.tags,
  clickCount: shortLinks.clickCount,
  isActive: shortLinks.isActive,
  expiresAt: shortLinks.expiresAt,
  maxClicks: shortLinks.maxClicks,
  createdAt: shortLinks.createdAt,
  updatedAt: shortLinks.updatedAt,
}

export const GET = withApiAuth(async (request, { caller, headers }) => {
  const url = new URL(request.url)
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number(url.searchParams.get("limit")) || DEFAULT_LIMIT)
  )
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1)
  const includeArchived = url.searchParams.get("include_archived") === "true"

  const where = includeArchived
    ? eq(shortLinks.userId, caller.userId)
    : and(eq(shortLinks.userId, caller.userId), isNull(shortLinks.archivedAt))

  const [rows, [total]] = await Promise.all([
    db
      .select(publicColumns)
      .from(shortLinks)
      .where(where)
      .orderBy(desc(shortLinks.createdAt))
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ value: count() }).from(shortLinks).where(where),
  ])

  return apiOk(rows, {
    headers,
    meta: {
      page,
      limit,
      total: Number(total?.value || 0),
      totalPages: Math.max(1, Math.ceil(Number(total?.value || 0) / limit)),
    },
  })
})

export const POST = withApiAuth(async (request, { caller, headers }) => {
  const body = await readJson<{
    url?: string
    originalUrl?: string
    alias?: string
    title?: string
    tags?: string[]
    expiresAt?: string
  }>(request)

  if (!body) {
    return apiError(400, "invalid_body", "Send a JSON object.", headers)
  }

  const destination = validateDestinationUrl(body.url ?? body.originalUrl)
  if (!destination.ok) {
    return apiError(422, "invalid_url", destination.error, headers)
  }

  // Same monthly quota the dashboard enforces — the API is not a way around it.
  const plan = planFor(caller.plan)
  if (plan.linksPerMonth !== null) {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const [used] = await db
      .select({ value: count() })
      .from(shortLinks)
      .where(
        and(
          eq(shortLinks.userId, caller.userId),
          gte(shortLinks.createdAt, startOfMonth)
        )
      )

    if (Number(used?.value || 0) >= plan.linksPerMonth) {
      return apiError(
        403,
        "quota_exceeded",
        `Monthly link limit of ${plan.linksPerMonth} reached on the ${plan.name} plan.`,
        headers
      )
    }
  }

  let shortCode: string
  if (body.alias) {
    const alias = validateAlias(body.alias)
    if (!alias.ok) return apiError(422, "invalid_alias", alias.error, headers)
    shortCode = alias.alias
  } else {
    shortCode = generateShortCode()
  }

  let expiresAt: Date | null = null
  if (body.expiresAt) {
    const parsed = new Date(body.expiresAt)
    if (Number.isNaN(parsed.getTime())) {
      return apiError(422, "invalid_expiry", "expiresAt must be an ISO 8601 timestamp.", headers)
    }
    expiresAt = parsed
  }

  const tags = Array.isArray(body.tags)
    ? body.tags.filter((t): t is string => typeof t === "string").slice(0, 20)
    : []

  const attempts = body.alias ? 1 : 5

  for (let i = 0; i < attempts; i++) {
    try {
      const [link] = await db
        .insert(shortLinks)
        .values({
          userId: caller.userId,
          originalUrl: destination.url,
          shortCode,
          customSlug: body.alias || null,
          title: body.title?.trim().slice(0, 200) || null,
          tags,
          expiresAt,
          isActive: true,
          clickCount: 0,
        })
        .returning(publicColumns)

      return apiOk(link, { status: 201, headers })
    } catch (err) {
      if ((err as { code?: string }).code === "23505") {
        if (body.alias) {
          return apiError(409, "alias_taken", "That alias is already in use.", headers)
        }
        shortCode = generateShortCode(7 + i)
        continue
      }
      throw err
    }
  }

  return apiError(500, "internal_error", "Could not allocate a short code.", headers)
})
