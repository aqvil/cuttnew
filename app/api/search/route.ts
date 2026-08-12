import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getLinksPage } from "@/lib/links/queries"
import { shortUrlDisplay } from "@/lib/app-url"

/**
 * Backs the ⌘K search in the dashboard header.
 *
 * Scoped to the signed-in user and capped at a handful of results — this is a
 * jump-to navigator, not a reporting endpoint.
 */
export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const query = new URL(request.url).searchParams.get("q")?.trim() ?? ""
  if (query.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const { items } = await getLinksPage({
    userId: session.user.id,
    search: query.slice(0, 100),
    status: "all",
    pageSize: 8,
  })

  return NextResponse.json({
    results: items.map((link) => ({
      id: link.id,
      title: link.title,
      shortCode: link.shortCode,
      shortUrl: shortUrlDisplay(link.shortCode),
      destination: link.originalUrl,
      clicks: link.clickCount ?? 0,
    })),
  })
}
