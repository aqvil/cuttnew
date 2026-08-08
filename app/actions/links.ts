"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { shortLinks } from "@/lib/db/schema"
import { eq, and, inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { hashPassword } from "@/lib/auth/password"

export async function createShortLink(data: any) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  // Basic URL validation
  try {
    new URL(data.originalUrl)
  } catch (e) {
    throw new Error("Invalid URL")
  }

  const hashedPassword = data.password ? await hashPassword(data.password) : null

  const [link] = await db.insert(shortLinks).values({
    userId: session.user.id,
    teamId: data.teamId || null,
    domainId: data.domainId || null,
    originalUrl: data.originalUrl,
    shortCode: data.shortCode,
    customSlug: data.customSlug || null,
    title: data.title || null,
    password: hashedPassword,
    tags: Array.isArray(data.tags) ? data.tags : [],
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    expirationUrl: data.expirationUrl || null,
    maxClicks: data.maxClicks ? parseInt(data.maxClicks, 10) : null,
    iosUrl: data.iosUrl || null,
    androidUrl: data.androidUrl || null,
    deepLinkScheme: data.deepLinkScheme || null,
    rotationUrls: Array.isArray(data.rotationUrls) ? data.rotationUrls : [],
    retargetingPixelIds: Array.isArray(data.retargetingPixelIds) ? data.retargetingPixelIds : [],
    isActive: data.isActive !== undefined ? data.isActive : true,
    clickCount: 0,
  }).returning()

  revalidatePath("/dashboard/links")
  return link
}

export async function updateShortLink(id: string, data: any) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  if (data.originalUrl) {
    try {
      new URL(data.originalUrl)
    } catch (e) {
      throw new Error("Invalid URL")
    }
  }

  const updateData: any = {
    originalUrl: data.originalUrl,
    title: data.title,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    expirationUrl: data.expirationUrl !== undefined ? data.expirationUrl : undefined,
    maxClicks: data.maxClicks !== undefined ? (data.maxClicks ? parseInt(data.maxClicks, 10) : null) : undefined,
    iosUrl: data.iosUrl !== undefined ? data.iosUrl : undefined,
    androidUrl: data.androidUrl !== undefined ? data.androidUrl : undefined,
    deepLinkScheme: data.deepLinkScheme !== undefined ? data.deepLinkScheme : undefined,
    rotationUrls: data.rotationUrls !== undefined ? data.rotationUrls : undefined,
    retargetingPixelIds: data.retargetingPixelIds !== undefined ? data.retargetingPixelIds : undefined,
    teamId: data.teamId !== undefined ? data.teamId : undefined,
    domainId: data.domainId !== undefined ? data.domainId : undefined,
    isActive: data.isActive !== undefined ? data.isActive : undefined,
    updatedAt: new Date(),
  }

  if (Array.isArray(data.tags)) {
    updateData.tags = data.tags
  }

  if (data.archived !== undefined) {
    updateData.archivedAt = data.archived ? new Date() : null
  }

  if (data.password !== undefined) {
    updateData.password = data.password ? await hashPassword(data.password) : null
  }

  await db.update(shortLinks)
    .set(updateData)
    .where(and(eq(shortLinks.id, id), eq(shortLinks.userId, session.user.id)))

  revalidatePath("/dashboard/links")
}

export async function deleteShortLink(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await db.delete(shortLinks).where(and(eq(shortLinks.id, id), eq(shortLinks.userId, session.user.id)))

  revalidatePath("/dashboard/links")
}

export async function bulkDeleteShortLinks(ids: string[]) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  if (ids.length === 0) return

  await db.delete(shortLinks)
    .where(and(inArray(shortLinks.id, ids), eq(shortLinks.userId, session.user.id)))

  revalidatePath("/dashboard/links")
}

export async function bulkSetArchived(ids: string[], archived: boolean) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  if (ids.length === 0) return

  await db.update(shortLinks)
    .set({ archivedAt: archived ? new Date() : null, updatedAt: new Date() })
    .where(and(inArray(shortLinks.id, ids), eq(shortLinks.userId, session.user.id)))

  revalidatePath("/dashboard/links")
}

