import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { shortLinks } from "@/lib/db/schema"
import { applyApiRateLimit } from "@/lib/api-middleware"

export async function GET(request: NextRequest) {
  const { response, headers } = applyApiRateLimit(request)
  if (response) return response

  try {
    const links = await db.query.shortLinks.findMany({
      limit: 100,
    })

    return NextResponse.json({ data: links }, { headers })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers })
  }
}

export async function POST(request: NextRequest) {
  const { response, headers } = applyApiRateLimit(request)
  if (response) return response

  try {
    const body = await request.json()
    if (!body.originalUrl || !body.shortCode) {
      return NextResponse.json({ error: "originalUrl and shortCode are required" }, { status: 400, headers })
    }

    const [newLink] = await db
      .insert(shortLinks)
      .values({
        originalUrl: body.originalUrl,
        shortCode: body.shortCode,
        customSlug: body.customSlug || null,
        title: body.title || null,
        iosUrl: body.iosUrl || null,
        androidUrl: body.androidUrl || null,
        deepLinkScheme: body.deepLinkScheme || null,
        rotationUrls: Array.isArray(body.rotationUrls) ? body.rotationUrls : [],
        maxClicks: body.maxClicks ? parseInt(body.maxClicks, 10) : null,
        expirationUrl: body.expirationUrl || null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      })
      .returning()

    return NextResponse.json({ data: newLink }, { status: 201, headers })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers })
  }
}
