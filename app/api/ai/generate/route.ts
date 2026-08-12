import { generateText, Output } from "ai"
import { z } from "zod"
import { auth } from "@/auth"
import { hit } from "@/lib/rate-limit"

/**
 * One-shot AI copy generation.
 *
 * Requires a session and is rate limited per user — it was previously an open
 * endpoint that billed LLM calls to this account for any anonymous caller.
 */
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!process.env.OPENAI_API_KEY && !process.env.GROQ_API_KEY) {
    return Response.json(
      { error: "The AI assistant isn't configured on this deployment." },
      { status: 503 }
    )
  }

  const limit = hit(`ai:generate:${session.user.id}`, { limit: 30, windowMs: 60_000 })
  if (!limit.allowed) {
    return Response.json(
      { error: `Slow down — try again in ${limit.resetInSeconds}s.` },
      { status: 429 }
    )
  }

  const body = await req.json().catch(() => null)
  if (!body || typeof body.type !== "string") {
    return Response.json({ error: "Send { type, context }" }, { status: 400 })
  }

  const { type } = body
  // Cap the free-text portion so the prompt can't be used to smuggle a large
  // arbitrary workload through this endpoint.
  const context = typeof body.context === "string" ? body.context.slice(0, 500) : ""

  let prompt = ""
  const schema = z.object({ result: z.string() })

  switch (type) {
    case "bio-description":
      prompt = `Generate a compelling bio description for a person or brand. 
Context: ${context || "a creative professional"}
Keep it under 160 characters, engaging, and personal.
Return just the description text.`
      break

    case "seo-title":
      prompt = `Generate an SEO-optimized page title.
Context: ${context || "a personal portfolio page"}
Keep it under 60 characters, include relevant keywords, and make it click-worthy.
Return just the title text.`
      break

    case "seo-description":
      prompt = `Generate an SEO-optimized meta description.
Context: ${context || "a personal portfolio page"}
Keep it under 155 characters, include a call-to-action, and be descriptive.
Return just the description text.`
      break

    case "link-title":
      prompt = `Generate a catchy link title for a button.
Context: ${context || "a portfolio project link"}
Keep it under 30 characters, action-oriented, and engaging.
Return just the title text.`
      break

    case "cta":
      prompt = `Generate a compelling call-to-action text.
Context: ${context || "newsletter signup"}
Keep it under 25 characters, urgent, and value-focused.
Return just the CTA text.`
      break

    default:
      return Response.json({ error: "Invalid generation type" }, { status: 400 })
  }

  const result = await generateText({
    model: process.env.GROQ_API_KEY ? "groq/llama-3.3-70b-versatile" : "openai/gpt-4o-mini",
    prompt,
    output: Output.object({ schema }),
  })

  return Response.json({ result: result.output.result })
}
