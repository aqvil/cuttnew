import { NextResponse } from "next/server"
import { streamText, convertToModelMessages } from "ai"
import { auth } from "@/auth"
import { hit } from "@/lib/rate-limit"

/**
 * AI copy assistant.
 *
 * This endpoint was previously unauthenticated, which made it a free LLM proxy
 * that anyone could bill to this account. It now requires a signed-in session
 * and is rate limited per user.
 *
 * Note: the feature has no UI at present (the assistant page redirects to the
 * dashboard) and requires an AI provider to be configured. It returns 503 when
 * one isn't, rather than failing with a provider stack trace.
 */
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!process.env.OPENAI_API_KEY && !process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { error: "The AI assistant isn't configured on this deployment." },
      { status: 503 }
    )
  }

  const limit = hit(`ai:chat:${session.user.id}`, { limit: 20, windowMs: 60_000 })
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `Slow down — try again in ${limit.resetInSeconds}s.` },
      { status: 429 }
    )
  }

  const body = await req.json().catch(() => null)
  if (!body || !Array.isArray(body.messages)) {
    return NextResponse.json({ error: "Send { messages: [...] }" }, { status: 400 })
  }

  const result = streamText({
    model: process.env.GROQ_API_KEY ? "groq/llama-3.3-70b-versatile" : "openai/gpt-4o-mini",
    system: `You are Cuttly AI, a helpful assistant for a link-in-bio and URL shortener platform.
Your job is to help users create compelling content for their bio pages and links.

You can help with:
- Writing catchy bio descriptions
- Creating SEO-friendly titles and meta descriptions
- Suggesting link titles and call-to-actions
- Providing tips for better engagement

Keep your responses concise, creative, and actionable. When providing options, give 2-3 variations.`,
    messages: await convertToModelMessages(body.messages),
  })

  return result.toUIMessageStreamResponse()
}
