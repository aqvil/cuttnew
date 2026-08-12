"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { apiKeys, profiles } from "@/lib/db/schema"
import { and, count, desc, eq, isNull } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { generateApiKey } from "@/lib/api/keys"
import { planFor } from "@/lib/plans"
import type { ActionResult } from "./links"

/**
 * API key management for Settings → API.
 *
 * `createApiKey` returns the plaintext key once. It is never stored and cannot
 * be retrieved again — the UI is responsible for making that clear.
 */

export interface ApiKeySummary {
  id: string
  name: string
  prefix: string
  lastUsedAt: Date | null
  createdAt: Date | null
}

export async function listApiKeys(): Promise<ApiKeySummary[]> {
  const session = await auth()
  if (!session?.user?.id) return []

  return db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      prefix: apiKeys.prefix,
      lastUsedAt: apiKeys.lastUsedAt,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(and(eq(apiKeys.userId, session.user.id), isNull(apiKeys.revokedAt)))
    .orderBy(desc(apiKeys.createdAt))
}

export async function createApiKey(
  name: string
): Promise<ActionResult<{ id: string; plaintext: string; prefix: string }>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: "Your session has expired. Sign in again to continue." }
  }

  const trimmed = (name || "").trim()
  if (!trimmed) return { ok: false, error: "Give this key a name so you can recognise it later." }
  if (trimmed.length > 60) return { ok: false, error: "Key names can be at most 60 characters." }

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, session.user.id),
    columns: { plan: true },
  })
  const plan = planFor(profile?.plan)

  if (plan.apiKeys === 0) {
    return {
      ok: false,
      error: `API access isn't included in the ${plan.name} plan. Upgrade to Pro to create keys.`,
    }
  }

  const [existing] = await db
    .select({ value: count() })
    .from(apiKeys)
    .where(and(eq(apiKeys.userId, session.user.id), isNull(apiKeys.revokedAt)))

  if (Number(existing?.value || 0) >= plan.apiKeys) {
    return {
      ok: false,
      error: `The ${plan.name} plan allows ${plan.apiKeys} active key(s). Revoke one first.`,
    }
  }

  const key = generateApiKey()

  const [created] = await db
    .insert(apiKeys)
    .values({
      userId: session.user.id,
      name: trimmed,
      prefix: key.prefix,
      keyHash: key.hash,
    })
    .returning({ id: apiKeys.id })

  revalidatePath("/dashboard/settings/api")

  return {
    ok: true,
    data: { id: created.id, plaintext: key.plaintext, prefix: key.prefix },
  }
}

/**
 * Revokes rather than deletes, so the audit trail (last used, created) survives
 * and the hash stays reserved.
 */
export async function revokeApiKey(id: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: "Your session has expired. Sign in again to continue." }
  }

  const revoked = await db
    .update(apiKeys)
    .set({ revokedAt: new Date() })
    .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, session.user.id), isNull(apiKeys.revokedAt)))
    .returning({ id: apiKeys.id })

  if (revoked.length === 0) {
    return { ok: false, error: "That key no longer exists." }
  }

  revalidatePath("/dashboard/settings/api")
  return { ok: true, data: undefined }
}
