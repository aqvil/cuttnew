import { NextResponse } from "next/server"
import { LIMITS, clientIp, hit, rateLimitHeaders } from "@/lib/rate-limit"
import { authenticateApiKey, type ApiCaller } from "./keys"

/**
 * Shared plumbing for the public REST API: one authentication path, one error
 * shape, one rate-limit policy. Every `/api/v1` route goes through
 * `withApiAuth` so an endpoint cannot accidentally ship unauthenticated.
 */

export interface ApiError {
  error: {
    code: string
    message: string
  }
}

export function apiError(
  status: number,
  code: string,
  message: string,
  headers?: Record<string, string>
): NextResponse<ApiError> {
  return NextResponse.json({ error: { code, message } }, { status, headers })
}

export function apiOk<T>(
  data: T,
  init?: { status?: number; headers?: Record<string, string>; meta?: Record<string, unknown> }
) {
  return NextResponse.json(
    init?.meta ? { data, meta: init.meta } : { data },
    { status: init?.status ?? 200, headers: init?.headers }
  )
}

export interface ApiContext {
  caller: ApiCaller
  headers: Record<string, string>
}

/**
 * `RouteContext` is whatever Next passes as the second argument — `{ params }`
 * for dynamic segments, absent otherwise. It is threaded through as the third
 * argument so handlers can read route params without losing type safety on the
 * first two.
 */
type Handler<RouteContext = unknown> = (
  request: Request,
  context: ApiContext,
  routeContext: RouteContext
) => Promise<NextResponse> | NextResponse

/**
 * Authenticates the request, applies the per-key rate limit, and normalises
 * unexpected failures into a generic 500 — internal error text never reaches
 * an API consumer.
 */
export function withApiAuth<RouteContext = unknown>(handler: Handler<RouteContext>) {
  return async (request: Request, routeContext: RouteContext): Promise<NextResponse> => {
    const outcome = await authenticateApiKey(request)

    if (outcome.status === "unavailable") {
      return apiError(
        503,
        "service_unavailable",
        "We couldn't verify your API key right now. Your key is probably fine — retry shortly.",
        { "Retry-After": "30" }
      )
    }

    if (outcome.status === "unauthenticated") {
      // Unauthenticated requests are throttled hard so the API can't be used
      // to probe for valid keys.
      const anon = hit(`api:anon:${clientIp(request.headers)}`, LIMITS.apiAnonymous)
      return apiError(
        401,
        "unauthorized",
        "Provide a valid API key: Authorization: Bearer ck_…",
        rateLimitHeaders(anon)
      )
    }

    const { caller } = outcome
    const limit = hit(`api:key:${caller.keyId}`, LIMITS.api)
    const headers = rateLimitHeaders(limit)

    if (!limit.allowed) {
      return apiError(
        429,
        "rate_limited",
        `Rate limit exceeded. Retry in ${limit.resetInSeconds}s.`,
        headers
      )
    }

    try {
      return await handler(request, { caller, headers }, routeContext)
    } catch (err) {
      console.error("[api] unhandled error:", err)
      return apiError(500, "internal_error", "Something went wrong on our end.", headers)
    }
  }
}

/** Parses a JSON body, returning null when it is absent or malformed. */
export async function readJson<T = Record<string, unknown>>(
  request: Request
): Promise<T | null> {
  try {
    const body = await request.json()
    return body && typeof body === "object" ? (body as T) : null
  } catch {
    return null
  }
}
