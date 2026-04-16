"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { profiles } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function updateProfile(data: any) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await db.update(profiles)
    .set({
      username: data.username,
      displayName: data.displayName,
      bio: data.bio,
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, session.user.id))

  revalidatePath("/dashboard/settings")
  revalidatePath("/dashboard")
}
