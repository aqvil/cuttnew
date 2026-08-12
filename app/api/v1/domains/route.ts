import { db } from "@/lib/db"
import { customDomains } from "@/lib/db/schema"
import { count, desc, eq } from "drizzle-orm"
import { apiError, apiOk, readJson, withApiAuth } from "@/lib/api/respond"
import { planFor } from "@/lib/plans"

/**
 * GET / POST /api/v1/domains — custom domains belonging to the API key's owner.
 *
 * Previously this listed every domain on the platform and accepted anonymous
 * writes.
 */

/** Hostname: labels of alphanumerics/hyphens, at least one dot, no scheme. */
const HOSTNAME = /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/

const publicColumns = {
  id: customDomains.id,
  domain: customDomains.domain,
  status: customDomains.status,
  verifiedAt: customDomains.verifiedAt,
  createdAt: customDomains.createdAt,
}

export const GET = withApiAuth(async (_request, { caller, headers }) => {
  const rows = await db
    .select(publicColumns)
    .from(customDomains)
    .where(eq(customDomains.userId, caller.userId))
    .orderBy(desc(customDomains.createdAt))

  return apiOk(rows, { headers })
})

export const POST = withApiAuth(async (request, { caller, headers }) => {
  const body = await readJson<{ domain?: string }>(request)
  if (!body?.domain || typeof body.domain !== "string") {
    return apiError(422, "invalid_domain", "domain is required.", headers)
  }

  // Accept what people paste, then validate the hostname itself.
  const domain = body.domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")

  if (!HOSTNAME.test(domain) || domain.length > 253) {
    return apiError(422, "invalid_domain", "Enter a valid domain, e.g. links.example.com", headers)
  }

  const plan = planFor(caller.plan)
  if (plan.customDomains === 0) {
    return apiError(
      403,
      "plan_required",
      `Custom domains aren't available on the ${plan.name} plan.`,
      headers
    )
  }

  const [existing] = await db
    .select({ value: count() })
    .from(customDomains)
    .where(eq(customDomains.userId, caller.userId))

  if (Number(existing?.value || 0) >= plan.customDomains) {
    return apiError(
      403,
      "quota_exceeded",
      `The ${plan.name} plan allows ${plan.customDomains} custom domain(s).`,
      headers
    )
  }

  try {
    const [created] = await db
      .insert(customDomains)
      .values({ userId: caller.userId, domain, status: "pending", trackingHeaders: [] })
      .returning(publicColumns)

    return apiOk(created, { status: 201, headers })
  } catch (err) {
    if ((err as { code?: string }).code === "23505") {
      return apiError(409, "domain_taken", "That domain is already connected.", headers)
    }
    throw err
  }
})
