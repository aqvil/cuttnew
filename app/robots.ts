import type { MetadataRoute } from "next"
import { appOrigin } from "@/lib/app-url"

/**
 * Short links and the dashboard must stay out of search indexes: a crawler
 * following `/l/…` would inflate click counts with traffic that isn't people,
 * and indexed short links leak destinations their owners may consider private.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/l/",
        "/dashboard/",
        "/auth/",
        "/api/",
        "/link-expired",
        "/link-inactive",
        "/link-not-found",
        "/link-unavailable",
      ],
    },
    sitemap: `${appOrigin()}/sitemap.xml`,
  }
}
