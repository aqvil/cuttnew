import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { shortLinks } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { applyApiRateLimit } from "@/lib/api-middleware"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response, headers } = applyApiRateLimit(request)
  if (response) return response

  const { id } = await params
  const link = await db.query.shortLinks.findFirst({
    where: eq(shortLinks.id, id),
  })

  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404, headers })
  }

  return NextResponse.json({ data: link }, { headers })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response, headers } = applyApiRateLimit(request)
  if (response) return response

  const { id } = await params
  const body = await request.json()

  try {
    const [updated] = await db
      .update(shortLinks)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(shortLinks.id, id))
      .returning()

    return NextResponse.json({ data: updated }, { headers })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response, headers } = applyApiRateLimit(request)
  if (response) return response

  const { id } = await params

  try {
    await db.delete(shortLinks).where(eq(shortLinks.id, id))
    return NextResponse.json({ success: true }, { headers })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers })
  }
}
