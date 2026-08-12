import type { MetadataRoute } from "next"
import { appOrigin } from "@/lib/app-url"

/** Only the public marketing pages — nothing behind a login, no short links. */
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = appOrigin()
  const lastModified = new Date()

  return [
    { url: `${origin}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${origin}/pricing`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${origin}/contact`, lastModified, changeFrequency: "yearly", priority: 0.5 },
    { url: `${origin}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${origin}/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ]
}
