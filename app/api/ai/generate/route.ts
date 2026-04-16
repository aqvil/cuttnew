import { generateText, Output } from "ai"
import { z } from "zod"

export async function POST(req: Request) {
  const { type, context } = await req.json()

  let prompt = ""
  let schema = z.object({ result: z.string() })

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
    model: "groq/llama-3.3-70b-versatile",
    prompt,
    output: Output.object({ schema }),
  })

  return Response.json({ result: result.object.result })
}
