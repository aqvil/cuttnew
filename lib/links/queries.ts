import "server-only"

import { db } from "@/lib/db"
import { qrCodes, shortLinks } from "@/lib/db/schema"
import { and, asc, count, desc, eq, gte, ilike, inArray, isNotNull, isNull, lte, or, sql } from "drizzle-orm"

/**
 * Read queries for the links list.
 *
 * Search, filtering, sorting and pagination all happen in Postgres. The
 * previous implementation shipped every one of a user's links to the browser
 * and filtered them in `useMemo`, which stops working somewhere around a few
 * thousand links and sends the full destination URL of every link over the
 * wire on first paint.
 */

export type LinkStatusFilter = "active" | "archived" | "expired" | "all"
export type LinkSort = "newest" | "oldest" | "clicks" | "title"

export interface LinksQuery {
  userId: string
  search?: string
  status?: LinkStatusFilter
  tag?: string
  sort?: LinkSort
  page?: number
  pageSize?: number
  /** ISO date — only links created on or after this day. */
  from?: string
  /** ISO date — only links created on or before this day. */
  to?: string
}

export interface LinkListItem {
  id: string
  title: string | null
  shortCode: string
  originalUrl: string
  tags: string[] | null
  hasPassword: boolean
  archivedAt: Date | null
  expiresAt: Date | null
  maxClicks: number | null
  isActive: boolean | null
  clickCount: number | null
  createdAt: Date | null
  qrCodeCount: number
}

export interface LinksPage {
  items: LinkListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100

function buildWhere(query: LinksQuery) {
  const clauses = [eq(shortLinks.userId, query.userId)]

  const status = query.status ?? "active"
  if (status === "active") {
    clauses.push(isNull(shortLinks.archivedAt))
  } else if (status === "archived") {
    clauses.push(isNotNull(shortLinks.archivedAt))
  } else if (status === "expired") {
    clauses.push(
      and(
        isNull(shortLinks.archivedAt),
        or(
          and(isNotNull(shortLinks.expiresAt), lte(shortLinks.expiresAt, new Date())),
          and(
            isNotNull(shortLinks.maxClicks),
            sql`${shortLinks.clickCount} >= ${shortLinks.maxClicks}`
          )
        )
      )!
    )
  }

  const search = query.search?.trim()
  if (search) {
    // ILIKE with a leading wildcard can't use a b-tree index, but it is the
    // right trade-off here: the result set is already scoped to one user.
    const pattern = `%${search.replace(/[%_]/g, (c) => `\\${c}`)}%`
    clauses.push(
      or(
        ilike(shortLinks.title, pattern),
        ilike(shortLinks.shortCode, pattern),
        ilike(shortLinks.originalUrl, pattern)
      )!
    )
  }

  if (query.tag) {
    clauses.push(sql`${query.tag} = ANY(COALESCE(${shortLinks.tags}, '{}'))`)
  }

  if (query.from) {
    const from = new Date(query.from)
    if (!Number.isNaN(from.getTime())) {
      from.setHours(0, 0, 0, 0)
      clauses.push(gte(shortLinks.createdAt, from))
    }
  }

  if (query.to) {
    const to = new Date(query.to)
    if (!Number.isNaN(to.getTime())) {
      to.setHours(23, 59, 59, 999)
      clauses.push(lte(shortLinks.createdAt, to))
    }
  }

  return and(...clauses)
}

function buildOrder(sort: LinkSort | undefined) {
  switch (sort) {
    case "oldest":
      return [asc(shortLinks.createdAt)]
    case "clicks":
      return [desc(shortLinks.clickCount), desc(shortLinks.createdAt)]
    case "title":
      return [asc(sql`LOWER(COALESCE(${shortLinks.title}, ${shortLinks.shortCode}))`)]
    default:
      return [desc(shortLinks.createdAt)]
  }
}

export async function getLinksPage(query: LinksQuery): Promise<LinksPage> {
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, query.pageSize ?? DEFAULT_PAGE_SIZE))
  const page = Math.max(1, query.page ?? 1)
  const where = buildWhere(query)

  const [rows, [totalRow]] = await Promise.all([
    db
      .select({
        id: shortLinks.id,
        title: shortLinks.title,
        shortCode: shortLinks.shortCode,
        originalUrl: shortLinks.originalUrl,
        tags: shortLinks.tags,
        // Never send the password hash to the client — only whether one exists.
        hasPassword: sql<boolean>`${shortLinks.password} IS NOT NULL`,
        archivedAt: shortLinks.archivedAt,
        expiresAt: shortLinks.expiresAt,
        maxClicks: shortLinks.maxClicks,
        isActive: shortLinks.isActive,
        clickCount: shortLinks.clickCount,
        createdAt: shortLinks.createdAt,
      })
      .from(shortLinks)
      .where(where)
      .orderBy(...buildOrder(query.sort))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ value: count() }).from(shortLinks).where(where),
  ])

  // One extra query for QR counts rather than N per row.
  const ids = rows.map((r) => r.id)
  const qrCounts = new Map<string, number>()
  if (ids.length > 0) {
    const counts = await db
      .select({ linkId: qrCodes.linkId, value: count() })
      .from(qrCodes)
      .where(and(inArray(qrCodes.linkId, ids), isNull(qrCodes.archivedAt)))
      .groupBy(qrCodes.linkId)
    for (const row of counts) qrCounts.set(row.linkId, Number(row.value))
  }

  const total = Number(totalRow?.value || 0)

  return {
    items: rows.map((row) => ({ ...row, qrCodeCount: qrCounts.get(row.id) ?? 0 })),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}

/** Distinct tags across a user's links, for the filter menu. */
export async function getUserTags(userId: string): Promise<string[]> {
  const rows = await db
    .select({ tag: sql<string>`DISTINCT UNNEST(COALESCE(${shortLinks.tags}, '{}'))` })
    .from(shortLinks)
    .where(eq(shortLinks.userId, userId))
    .limit(200)

  return rows.map((r) => r.tag).filter(Boolean).sort((a, b) => a.localeCompare(b))
}

export interface LinkCounters {
  totalLinks: number
  activeLinks: number
  archivedLinks: number
  totalClicks: number
}

/** Headline counters for the dashboard, computed in a single round trip. */
export async function getLinkCounters(userId: string): Promise<LinkCounters> {
  const [row] = await db
    .select({
      totalLinks: count(),
      activeLinks: sql<number>`COUNT(*) FILTER (WHERE ${shortLinks.archivedAt} IS NULL)`,
      archivedLinks: sql<number>`COUNT(*) FILTER (WHERE ${shortLinks.archivedAt} IS NOT NULL)`,
      totalClicks: sql<number>`COALESCE(SUM(${shortLinks.clickCount}), 0)`,
    })
    .from(shortLinks)
    .where(eq(shortLinks.userId, userId))

  return {
    totalLinks: Number(row?.totalLinks || 0),
    activeLinks: Number(row?.activeLinks || 0),
    archivedLinks: Number(row?.archivedLinks || 0),
    totalClicks: Number(row?.totalClicks || 0),
  }
}

/** Fetches one link the caller owns, without the password hash. */
export async function getOwnedLink(userId: string, id: string) {
  const [row] = await db
    .select({
      id: shortLinks.id,
      title: shortLinks.title,
      shortCode: shortLinks.shortCode,
      originalUrl: shortLinks.originalUrl,
      customSlug: shortLinks.customSlug,
      tags: shortLinks.tags,
      hasPassword: sql<boolean>`${shortLinks.password} IS NOT NULL`,
      archivedAt: shortLinks.archivedAt,
      expiresAt: shortLinks.expiresAt,
      expirationUrl: shortLinks.expirationUrl,
      maxClicks: shortLinks.maxClicks,
      iosUrl: shortLinks.iosUrl,
      androidUrl: shortLinks.androidUrl,
      isActive: shortLinks.isActive,
      clickCount: shortLinks.clickCount,
      createdAt: shortLinks.createdAt,
      updatedAt: shortLinks.updatedAt,
    })
    .from(shortLinks)
    .where(and(eq(shortLinks.id, id), eq(shortLinks.userId, userId)))
    .limit(1)

  return row ?? null
}

export type OwnedLink = NonNullable<Awaited<ReturnType<typeof getOwnedLink>>>
