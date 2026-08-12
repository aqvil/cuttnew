import { db } from "@/lib/db"
import { teamMembers, teams } from "@/lib/db/schema"
import { count, desc, eq } from "drizzle-orm"
import { apiError, apiOk, readJson, withApiAuth } from "@/lib/api/respond"
import { planFor } from "@/lib/plans"

/**
 * GET / POST /api/v1/teams — teams the API key's owner belongs to.
 *
 * Previously listed every team on the platform to anonymous callers.
 */

const SLUG = /^[a-z0-9](?:[a-z0-9-]{1,46}[a-z0-9])?$/
const MAX_TEAMS_PER_OWNER = 10

export const GET = withApiAuth(async (_request, { caller, headers }) => {
  const rows = await db
    .select({
      id: teams.id,
      name: teams.name,
      slug: teams.slug,
      role: teamMembers.role,
      createdAt: teams.createdAt,
    })
    .from(teamMembers)
    .innerJoin(teams, eq(teams.id, teamMembers.teamId))
    .where(eq(teamMembers.userId, caller.userId))
    .orderBy(desc(teams.createdAt))

  return apiOk(rows, { headers })
})

export const POST = withApiAuth(async (request, { caller, headers }) => {
  const plan = planFor(caller.plan)
  if (!plan.teamCollaboration) {
    return apiError(
      403,
      "plan_required",
      `Team collaboration isn't available on the ${plan.name} plan.`,
      headers
    )
  }

  const body = await readJson<{ name?: string; slug?: string }>(request)
  const name = body?.name?.trim()
  if (!name) return apiError(422, "invalid_name", "name is required.", headers)
  if (name.length > 100) return apiError(422, "invalid_name", "name is too long.", headers)

  const slug = (body?.slug || name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)

  if (!SLUG.test(slug)) {
    return apiError(422, "invalid_slug", "slug must be 2–48 lowercase letters, numbers or hyphens.", headers)
  }

  const [owned] = await db
    .select({ value: count() })
    .from(teams)
    .where(eq(teams.ownerId, caller.userId))

  if (Number(owned?.value || 0) >= MAX_TEAMS_PER_OWNER) {
    return apiError(403, "quota_exceeded", `You can own at most ${MAX_TEAMS_PER_OWNER} teams.`, headers)
  }

  try {
    // Creating the team and the owner membership must succeed together —
    // a team with no members is unreachable from the UI.
    const created = await db.transaction(async (tx) => {
      const [team] = await tx
        .insert(teams)
        .values({ ownerId: caller.userId, name, slug })
        .returning({ id: teams.id, name: teams.name, slug: teams.slug, createdAt: teams.createdAt })

      await tx.insert(teamMembers).values({
        teamId: team.id,
        userId: caller.userId,
        role: "owner",
        status: "active",
      })

      return team
    })

    return apiOk(created, { status: 201, headers })
  } catch (err) {
    if ((err as { code?: string }).code === "23505") {
      return apiError(409, "slug_taken", "That team slug is already in use.", headers)
    }
    throw err
  }
})
