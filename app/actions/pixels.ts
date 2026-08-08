"use server"

import { db } from "@/lib/db"
import { retargetingPixels } from "@/lib/db/schema"
import { auth } from "@/auth"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getRetargetingPixels() {
  const session = await auth()
  if (!session?.user?.id) return []

  return db.query.retargetingPixels.findMany({
    where: eq(retargetingPixels.userId, session.user.id),
  })
}

export async function createRetargetingPixel(
  name: string,
  provider: "facebook" | "gtm" | "tiktok" | "twitter" | "linkedin",
  pixelId: string,
  teamId?: string
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const [pixel] = await db
    .insert(retargetingPixels)
    .values({
      userId: session.user.id,
      teamId: teamId || null,
      name,
      provider,
      pixelId,
    })
    .returning()

  revalidatePath("/dashboard/links")
  return pixel
}

export async function deleteRetargetingPixel(pixelId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await db
    .delete(retargetingPixels)
    .where(and(eq(retargetingPixels.id, pixelId), eq(retargetingPixels.userId, session.user.id)))

  revalidatePath("/dashboard/links")
  return { success: true }
}
