import { NextRequest, NextResponse } from "next/server"

interface RateLimitStore {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitStore>()

const LIMIT = 360 // 360 requests
const WINDOW_MS = 60 * 1000 // 60 seconds

export function applyApiRateLimit(request: NextRequest): { response?: NextResponse; headers: Record<string, string> } {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "global-api-client"
  const now = Date.now()

  let record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    record = {
      count: 0,
      resetTime: now + WINDOW_MS,
    }
    rateLimitMap.set(ip, record)
  }

  record.count += 1

  const remaining = Math.max(0, LIMIT - record.count)
  const resetSec = Math.ceil((record.resetTime - now) / 1000)

  const headers = {
    "X-RateLimit-Limit": String(LIMIT),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(resetSec),
  }

  if (record.count > LIMIT) {
    return {
      response: NextResponse.json(
        { error: "API rate limit exceeded. Max 360 requests per 60 seconds." },
        { status: 429, headers }
      ),
      headers,
    }
  }

  return { headers }
}
