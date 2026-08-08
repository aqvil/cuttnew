"use server"

import { db } from "@/lib/db"
import { customDomains, globalTrackingHeaders } from "@/lib/db/schema"
import { auth } from "@/auth"
import { eq, and, count } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getCustomDomains() {
  const session = await auth()
  if (!session?.user?.id) return []

  try {
    return await db.query.customDomains.findMany({
      where: eq(customDomains.userId, session.user.id),
    })
  } catch (err) {
    console.error("Custom domains query error:", err)
    return []
  }
}

export async function addCustomDomain(domainName: string, teamId?: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  // Check 99 custom domain limit
  const domainCount = await db
    .select({ count: count() })
    .from(customDomains)
    .where(eq(customDomains.userId, session.user.id))

  if ((domainCount[0]?.count || 0) >= 99) {
    throw new Error("Maximum 99 branded domains limit reached.")
  }

  const [domain] = await db
    .insert(customDomains)
    .values({
      userId: session.user.id,
      teamId: teamId || null,
      domain: domainName.toLowerCase().trim(),
      trackingHeaders: [],
      status: "active",
    })
    .returning()

  revalidatePath("/dashboard/domains")
  return domain
}

export async function addDomainTrackingHeader(domainId: string, headerScript: string) {
  const session = auth()
  const domain = await db.query.customDomains.findFirst({
    where: eq(customDomains.id, domainId),
  })

  if (!domain) throw new Error("Domain not found")

  const headers = (domain.trackingHeaders as string[]) || []
  if (headers.length >= 15) {
    throw new Error("Maximum 15 tracking HEADER scripts allowed per custom domain.")
  }

  const updatedHeaders = [...headers, headerScript]
  await db
    .update(customDomains)
    .set({ trackingHeaders: updatedHeaders })
    .where(eq(customDomains.id, domainId))

  revalidatePath("/dashboard/domains")
  return { success: true }
}

export async function getGlobalTrackingHeaders() {
  const session = await auth()
  if (!session?.user?.id) return []

  return db.query.globalTrackingHeaders.findMany({
    where: eq(globalTrackingHeaders.userId, session.user.id),
  })
}

export async function addGlobalTrackingHeader(name: string, script: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  // Check limit (99 headers for 2s.ms Domain)
  const headerCount = await db
    .select({ count: count() })
    .from(globalTrackingHeaders)
    .where(eq(globalTrackingHeaders.userId, session.user.id))

  if ((headerCount[0]?.count || 0) >= 99) {
    throw new Error("Maximum 99 global tracking HEADER scripts allowed.")
  }

  const [header] = await db
    .insert(globalTrackingHeaders)
    .values({
      userId: session.user.id,
      name,
      script,
      isActive: true,
    })
    .returning()

  revalidatePath("/dashboard/domains")
  return header
}

export async function deleteCustomDomain(domainId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await db
    .delete(customDomains)
    .where(and(eq(customDomains.id, domainId), eq(customDomains.userId, session.user.id)))

  revalidatePath("/dashboard/domains")
  return { success: true }
}
