import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { customDomains } from "@/lib/db/schema"
import { applyApiRateLimit } from "@/lib/api-middleware"

export async function GET(request: NextRequest) {
  const { response, headers } = applyApiRateLimit(request)
  if (response) return response

  try {
    const domains = await db.query.customDomains.findMany()
    return NextResponse.json({ data: domains }, { headers })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers })
  }
}

export async function POST(request: NextRequest) {
  const { response, headers } = applyApiRateLimit(request)
  if (response) return response

  try {
    const body = await request.json()
    if (!body.domain) {
      return NextResponse.json({ error: "domain is required" }, { status: 400, headers })
    }

    const [domain] = await db
      .insert(customDomains)
      .values({
        domain: body.domain.toLowerCase().trim(),
        trackingHeaders: body.trackingHeaders || [],
        status: "active",
      })
      .returning()

    return NextResponse.json({ data: domain }, { status: 201, headers })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers })
  }
}
