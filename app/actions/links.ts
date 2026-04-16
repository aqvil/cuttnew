"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { shortLinks } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function createShortLink(data: any) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const [link] = await db.insert(shortLinks).values({
    userId: session.user.id,
    originalUrl: data.originalUrl,
    shortCode: data.shortCode,
    title: data.title || null,
    password: data.password || null,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    isActive: true,
    clickCount: 0,
  }).returning()

  revalidatePath("/dashboard/links")
  return link
}

export async function updateShortLink(id: string, data: any) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await db.update(shortLinks)
    .set({
      originalUrl: data.originalUrl,
      title: data.title,
      password: data.password,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      updatedAt: new Date(),
    })
    .where(eq(shortLinks.id, id))

  revalidatePath("/dashboard/links")
}

export async function deleteShortLink(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await db.delete(shortLinks).where(eq(shortLinks.id, id))
  
  revalidatePath("/dashboard/links")
}
