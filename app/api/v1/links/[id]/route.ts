import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { shortLinks } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"
import { apiError, apiOk, readJson, withApiAuth } from "@/lib/api/respond"
import { validateDestinationUrl } from "@/lib/links/url"

/**
 * GET / PATCH / DELETE /api/v1/links/:id
 *
 * Every query is scoped by `userId` as well as `id`. Previously any caller
 * could read, rewrite or delete any link on the platform by guessing a UUID —
 * and PATCH spread the raw request body straight into the UPDATE, so a caller
 * could reassign `user_id` and steal a link outright.
 */

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

type RouteContext = { params: Promise<{ id: string }> }

export const GET = withApiAuth<RouteContext>(async (_request, { caller, headers }, context) => {
  const { id } = await context.params

  const [link] = await db
    .select(publicColumns)
    .from(shortLinks)
    .where(and(eq(shortLinks.id, id), eq(shortLinks.userId, caller.userId)))
    .limit(1)

  if (!link) return apiError(404, "not_found", "No link with that id.", headers)
  return apiOk(link, { headers })
})

export const PATCH = withApiAuth<RouteContext>(async (request, { caller, headers }, context) => {
  const { id } = await context.params
  const body = await readJson<{
    url?: string
    originalUrl?: string
    title?: string | null
    tags?: string[]
    isActive?: boolean
    expiresAt?: string | null
    maxClicks?: number | null
  }>(request)

  if (!body) return apiError(400, "invalid_body", "Send a JSON object.", headers)

  // Allow-list of updatable fields. Nothing else from the body is used.
  const patch: Record<string, unknown> = { updatedAt: new Date() }

  const rawUrl = body.url ?? body.originalUrl
  if (rawUrl !== undefined) {
    const destination = validateDestinationUrl(rawUrl)
    if (!destination.ok) return apiError(422, "invalid_url", destination.error, headers)
    patch.originalUrl = destination.url
  }

  if (body.title !== undefined) {
    patch.title = body.title ? String(body.title).trim().slice(0, 200) : null
  }

  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags)) {
      return apiError(422, "invalid_tags", "tags must be an array of strings.", headers)
    }
    patch.tags = body.tags.filter((t): t is string => typeof t === "string").slice(0, 20)
  }

  if (body.isActive !== undefined) patch.isActive = Boolean(body.isActive)

  if (body.expiresAt !== undefined) {
    if (body.expiresAt === null) {
      patch.expiresAt = null
    } else {
      const parsed = new Date(body.expiresAt)
      if (Number.isNaN(parsed.getTime())) {
        return apiError(422, "invalid_expiry", "expiresAt must be ISO 8601 or null.", headers)
      }
      patch.expiresAt = parsed
    }
  }

  if (body.maxClicks !== undefined) {
    if (body.maxClicks === null) {
      patch.maxClicks = null
    } else if (!Number.isInteger(body.maxClicks) || body.maxClicks < 1) {
      return apiError(422, "invalid_max_clicks", "maxClicks must be an integer ≥ 1 or null.", headers)
    } else {
      patch.maxClicks = body.maxClicks
    }
  }

  if (Object.keys(patch).length === 1) {
    return apiError(422, "no_changes", "Provide at least one field to update.", headers)
  }

  const [updated] = await db
    .update(shortLinks)
    .set(patch)
    .where(and(eq(shortLinks.id, id), eq(shortLinks.userId, caller.userId)))
    .returning(publicColumns)

  if (!updated) return apiError(404, "not_found", "No link with that id.", headers)
  return apiOk(updated, { headers })
})

export const DELETE = withApiAuth<RouteContext>(async (_request, { caller, headers }, context) => {
  const { id } = await context.params

  const deleted = await db
    .delete(shortLinks)
    .where(and(eq(shortLinks.id, id), eq(shortLinks.userId, caller.userId)))
    .returning({ id: shortLinks.id })

  if (deleted.length === 0) {
    return apiError(404, "not_found", "No link with that id.", headers)
  }

  return new NextResponse(null, { status: 204, headers })
})
