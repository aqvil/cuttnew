"use server"

import { db } from "@/lib/db"
import { shortLinks, linkAnalytics } from "@/lib/db/schema"
import { eq, sql } from "drizzle-orm"
import { verifyPassword } from "@/lib/auth/password"

export async function unlockShortLink(code: string, passwordAttempt: string) {
  const link = await db.query.shortLinks.findFirst({
    where: eq(shortLinks.shortCode, code),
  })

  if (!link) {
    throw new Error("Link not found")
  }

  if (!(await verifyPassword(passwordAttempt, link.password))) {
    throw new Error("Incorrect password")
  }

  // Record click analytics
  await db.insert(linkAnalytics).values({
    linkId: link.id,
    clickedAt: new Date(),
  })

  // Increment click count
  await db.update(shortLinks)
    .set({ clickCount: (link.clickCount || 0) + 1 })
    .where(eq(shortLinks.id, link.id))

  return link.originalUrl
}
