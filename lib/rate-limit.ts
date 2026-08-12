import "server-only"

/**
 * Fixed-window rate limiter shared by server actions, the public API and the
 * redirect path.
 *
 * State lives in the process, which is the right trade-off for a single-region
 * deployment: no extra infrastructure, no network hop on the hot redirect path.
 * The consequence — limits are per-instance — is documented rather than hidden;
 * swapping `hit()` for a Redis INCR is the only change needed to make it global.
 *
 * The previous implementation grew its Map forever. This one evicts expired
 * buckets on a schedule and caps total size so a flood of unique IPs can't
 * exhaust memory.
 */

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

/** Hard ceiling on tracked keys; oldest are dropped first when exceeded. */
const MAX_KEYS = 20_000

/** Evict expired buckets no more than once a minute. */
const SWEEP_INTERVAL_MS = 60_000
let lastSweep = 0

function sweep(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return
  lastSweep = now

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }

  // If still oversized after expiry, drop from the front (insertion order).
  if (buckets.size > MAX_KEYS) {
    const excess = buckets.size - MAX_KEYS
    let dropped = 0
    for (const key of buckets.keys()) {
      buckets.delete(key)
      if (++dropped >= excess) break
    }
  }
}

export interface RateLimitResult {
  /** False when the caller has exceeded the limit and should be rejected. */
  allowed: boolean
  limit: number
  remaining: number
  /** Seconds until the window resets. */
  resetInSeconds: number
}

export interface RateLimitOptions {
  /** Requests permitted per window. */
  limit: number
  /** Window length in milliseconds. */
  windowMs: number
}

/**
 * Records one hit against `key` and reports whether it is allowed.
 * `key` should be namespaced by action, e.g. `link:create:<userId>`.
 */
export function hit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  sweep(now)

  let bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + options.windowMs }
    buckets.set(key, bucket)
  }

  bucket.count += 1

  const remaining = Math.max(0, options.limit - bucket.count)
  const resetInSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))

  return {
    allowed: bucket.count <= options.limit,
    limit: options.limit,
    remaining,
    resetInSeconds,
  }
}

/** Clears a key early — used after a successful login to forgive failed attempts. */
export function reset(key: string) {
  buckets.delete(key)
}

/** Standard headers so API clients can back off intelligently. */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.resetInSeconds),
  }
  if (!result.allowed) headers["Retry-After"] = String(result.resetInSeconds)
  return headers
}

/**
 * Best-effort client IP. Behind a proxy the leftmost `x-forwarded-for` entry is
 * the client; without one we fall back to a shared bucket, which is stricter
 * rather than more permissive.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim()
    if (first) return first
  }
  return headers.get("x-real-ip") || headers.get("cf-connecting-ip") || "unknown"
}

/** Preset budgets, kept in one place so limits are easy to audit. */
export const LIMITS = {
  /** Signed-in link creation. Generous — this is the core action. */
  linkCreate: { limit: 60, windowMs: 60_000 },
  /** Anonymous link creation from the marketing page. */
  anonLinkCreate: { limit: 5, windowMs: 60 * 60_000 },
  /** Password attempts on a protected link. */
  unlock: { limit: 10, windowMs: 10 * 60_000 },
  /** Sign-in attempts per IP. */
  auth: { limit: 20, windowMs: 15 * 60_000 },
  /** Account registration per IP. */
  register: { limit: 5, windowMs: 60 * 60_000 },
  /** Contact form submissions per IP. */
  contact: { limit: 3, windowMs: 60 * 60_000 },
  /** Authenticated REST API calls per key. */
  api: { limit: 300, windowMs: 60_000 },
  /** Unauthenticated API probing. */
  apiAnonymous: { limit: 20, windowMs: 60_000 },
} as const satisfies Record<string, RateLimitOptions>
