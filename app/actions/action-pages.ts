"use server"

import { db } from "@/lib/db"
import { actionPages } from "@/lib/db/schema"
import { auth } from "@/auth"
import { eq, and, count } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getActionPages() {
  const session = await auth()
  if (!session?.user?.id) return []

  return db.query.actionPages.findMany({
    where: eq(actionPages.userId, session.user.id),
  })
}

export async function createActionPage(
  title: string,
  slug: string,
  description?: string,
  content: any = {},
  teamId?: string
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  // Check 20 action pages limit
  const pageCount = await db
    .select({ count: count() })
    .from(actionPages)
    .where(eq(actionPages.userId, session.user.id))

  if ((pageCount[0]?.count || 0) >= 20) {
    throw new Error("Maximum 20 Action Pages limit reached.")
  }

  const [newPage] = await db
    .insert(actionPages)
    .values({
      userId: session.user.id,
      teamId: teamId || null,
      title,
      slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      description,
      content,
      isActive: true,
    })
    .returning()

  revalidatePath("/dashboard/action-pages")
  return newPage
}

export async function updateActionPage(
  id: string,
  data: {
    title?: string
    description?: string
    content?: any
    isActive?: boolean
  }
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const [updated] = await db
    .update(actionPages)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(actionPages.id, id), eq(actionPages.userId, session.user.id)))
    .returning()

  revalidatePath("/dashboard/action-pages")
  return updated
}

export async function deleteActionPage(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await db
    .delete(actionPages)
    .where(and(eq(actionPages.id, id), eq(actionPages.userId, session.user.id)))

  revalidatePath("/dashboard/action-pages")
  return { success: true }
}
