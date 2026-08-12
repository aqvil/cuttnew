import "server-only"

import { db } from "@/lib/db"
import { linkAnalytics, qrCodes, shortLinks } from "@/lib/db/schema"
import { and, count, desc, eq, ilike, isNull, or, sql } from "drizzle-orm"

export interface QrCodeListItem {
  id: string
  title: string | null
  foregroundColor: string | null
  backgroundColor: string | null
  logoUrl: string | null
  errorCorrection: string | null
  createdAt: Date | null
  linkId: string
  shortCode: string
  destinationUrl: string
  /** Real scans, attributed via the `?qr=1` marker on the encoded URL. */
  scans: number
}

/**
 * QR codes with their link and a real scan count.
 *
 * The scan total is a correlated subquery rather than a join + GROUP BY so a
 * code with no scans still returns a row with zero.
 */
export async function getQrCodes(
  userId: string,
  search?: string
): Promise<QrCodeListItem[]> {
  const clauses = [eq(qrCodes.userId, userId), isNull(qrCodes.archivedAt)]

  const term = search?.trim()
  if (term) {
    const pattern = `%${term.replace(/[%_]/g, (c) => `\\${c}`)}%`
    clauses.push(
      or(
        ilike(qrCodes.title, pattern),
        ilike(shortLinks.shortCode, pattern),
        ilike(shortLinks.originalUrl, pattern)
      )!
    )
  }

  const rows = await db
    .select({
      id: qrCodes.id,
      title: qrCodes.title,
      foregroundColor: qrCodes.foregroundColor,
      backgroundColor: qrCodes.backgroundColor,
      logoUrl: qrCodes.logoUrl,
      errorCorrection: qrCodes.errorCorrection,
      createdAt: qrCodes.createdAt,
      linkId: shortLinks.id,
      shortCode: shortLinks.shortCode,
      destinationUrl: shortLinks.originalUrl,
      scans: sql<number>`(
        SELECT COUNT(*) FROM ${linkAnalytics}
        WHERE ${linkAnalytics.linkId} = ${shortLinks.id}
          AND ${linkAnalytics.source} = 'qr'
      )`,
    })
    .from(qrCodes)
    .innerJoin(shortLinks, eq(shortLinks.id, qrCodes.linkId))
    .where(and(...clauses))
    .orderBy(desc(qrCodes.createdAt))
    .limit(200)

  return rows.map((row) => ({ ...row, scans: Number(row.scans) }))
}

/** QR codes attached to one link, shown on the link detail page. */
export async function getQrCodesForLink(userId: string, linkId: string) {
  return db
    .select({
      id: qrCodes.id,
      title: qrCodes.title,
      foregroundColor: qrCodes.foregroundColor,
      backgroundColor: qrCodes.backgroundColor,
      logoUrl: qrCodes.logoUrl,
      errorCorrection: qrCodes.errorCorrection,
      createdAt: qrCodes.createdAt,
    })
    .from(qrCodes)
    .where(and(eq(qrCodes.userId, userId), eq(qrCodes.linkId, linkId), isNull(qrCodes.archivedAt)))
    .orderBy(desc(qrCodes.createdAt))
}

export async function countQrCodes(userId: string): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(qrCodes)
    .where(and(eq(qrCodes.userId, userId), isNull(qrCodes.archivedAt)))
  return Number(row?.value || 0)
}

/** Links a user can attach a new QR code to. */
export async function getLinkOptions(userId: string) {
  return db
    .select({
      id: shortLinks.id,
      title: shortLinks.title,
      shortCode: shortLinks.shortCode,
      originalUrl: shortLinks.originalUrl,
    })
    .from(shortLinks)
    .where(and(eq(shortLinks.userId, userId), isNull(shortLinks.archivedAt)))
    .orderBy(desc(shortLinks.createdAt))
    .limit(200)
}
