import "server-only"

import crypto from "crypto"
import { db } from "@/lib/db"
import { apiKeys, profiles } from "@/lib/db/schema"
import { and, eq, isNull } from "drizzle-orm"

/**
 * API key issuance and verification.
 *
 * The plaintext key exists only in the response that creates it. What we store
 * is a SHA-256 hash, so a database leak does not hand over working credentials.
 * SHA-256 (rather than a slow KDF) is correct here: the key is 32 bytes of
 * CSPRNG output, so there is no low-entropy secret to grind.
 */

const KEY_PREFIX = "ck_"
const PREFIX_DISPLAY_LENGTH = 12

export interface GeneratedKey {
  /** Shown to the user exactly once. */
  plaintext: string
  /** Non-secret leading characters, stored for display. */
  prefix: string
  hash: string
}

export function generateApiKey(): GeneratedKey {
  const secret = crypto.randomBytes(32).toString("base64url")
  const plaintext = `${KEY_PREFIX}${secret}`

  return {
    plaintext,
    prefix: plaintext.slice(0, PREFIX_DISPLAY_LENGTH),
    hash: hashApiKey(plaintext),
  }
}

export function hashApiKey(plaintext: string): string {
  return crypto.createHash("sha256").update(plaintext).digest("hex")
}

export interface ApiCaller {
  userId: string
  keyId: string
  plan: string
}

/** "unauthenticated" means the key is bad; "unavailable" means we couldn't check. */
export type AuthOutcome =
  | { status: "ok"; caller: ApiCaller }
  | { status: "unauthenticated" }
  | { status: "unavailable" }

/**
 * Resolves an `Authorization: Bearer <key>` header to the owning account.
 *
 * Distinguishes "your key is wrong" (401) from "we couldn't verify it" (503).
 * Collapsing the two would tell a client with a perfectly good key to throw it
 * away during a database outage. Neither outcome serves any data.
 */
export async function authenticateApiKey(request: Request): Promise<AuthOutcome> {
  const header = request.headers.get("authorization")
  if (!header) return { status: "unauthenticated" }

  const match = header.match(/^Bearer\s+(.+)$/i)
  if (!match) return { status: "unauthenticated" }

  const plaintext = match[1].trim()
  if (!plaintext.startsWith(KEY_PREFIX) || plaintext.length > 200) {
    return { status: "unauthenticated" }
  }

  let record:
    | { id: string; userId: string; plan: string | null }
    | undefined

  try {
    ;[record] = await db
      .select({
        id: apiKeys.id,
        userId: apiKeys.userId,
        plan: profiles.plan,
      })
      .from(apiKeys)
      .leftJoin(profiles, eq(profiles.id, apiKeys.userId))
      .where(and(eq(apiKeys.keyHash, hashApiKey(plaintext)), isNull(apiKeys.revokedAt)))
      .limit(1)
  } catch (err) {
    console.error("[api] key lookup failed:", err)
    return { status: "unavailable" }
  }

  if (!record) return { status: "unauthenticated" }

  // Fire-and-forget: last-used is informational and must not add latency or
  // fail the request.
  void db
    .update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, record.id))
    .catch(() => {})

  return {
    status: "ok",
    caller: { userId: record.userId, keyId: record.id, plan: record.plan || "free" },
  }
}
