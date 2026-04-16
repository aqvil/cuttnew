"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { bioPages, bioBlocks } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function updateBioPage(id: string, data: any) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await db.update(bioPages)
    .set({
      title: data.title,
      description: data.description,
      isPublished: data.isPublished,
      theme: data.theme,
      updatedAt: new Date(),
    })
    .where(eq(bioPages.id, id))

  revalidatePath(`/dashboard/bio/${id}`)
  revalidatePath(`/p/${data.slug}`)
}

export async function saveBioBlocks(pageId: string, blocks: any[]) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  // Handle reordering by deleting and re-inserting (standard pattern for ordered collections in some cases, 
  // though more efficient ways exist, we'll follow the existing logic for now)
  await db.delete(bioBlocks).where(eq(bioBlocks.pageId, pageId))

  if (blocks.length > 0) {
    await db.insert(bioBlocks).values(
      blocks.map((block, index) => ({
        id: block.id,
        pageId,
        type: block.type,
        content: block.content,
        position: index,
        isVisible: block.isVisible,
      }))
    )
  }

  revalidatePath(`/dashboard/bio/${pageId}`)
}

export async function recordBioClick(blockId: string) {
  await db.insert(linkAnalytics).values({
    bioBlockId: blockId,
  })
}

export async function subscribeToEmail(pageId: string, email: string) {
  await db.insert(emailSubscribers).values({
    pageId,
    email,
  })
}
