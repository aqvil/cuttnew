"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { profiles, teamMembers, teams, users } from "@/lib/db/schema"
import { and, count, desc, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { planFor } from "@/lib/plans"
import type { ActionResult } from "./links"

/**
 * Team workspaces.
 *
 * Two authorization bugs are fixed here:
 *
 * 1. `inviteTeamMember` performed no membership check at all — any signed-in
 *    user could add anyone to any team by passing its id.
 * 2. It resolved the invitee with `eq(profiles.id, email)`, comparing a user id
 *    column to an email address. That never matched, so every invitee was
 *    filed as an unresolved "pending" row even when they already had an
 *    account.
 */

const MAX_TEAMS_PER_OWNER = 10
const MAX_MEMBERS_PER_TEAM = 20

const SLUG = /^[a-z0-9](?:[a-z0-9-]{0,46}[a-z0-9])?$/

export interface TeamSummary {
  id: string
  name: string
  slug: string
  role: string | null
  memberCount: number
  isOwner: boolean
  createdAt: Date | null
}

export async function getUserTeams(): Promise<TeamSummary[]> {
  const session = await auth()
  if (!session?.user?.id) return []

  try {
    const rows = await db
      .select({
        id: teams.id,
        name: teams.name,
        slug: teams.slug,
        role: teamMembers.role,
        ownerId: teams.ownerId,
        createdAt: teams.createdAt,
        // Real count, rather than the hardcoded "1 / 20" the UI used to show.
        memberCount: sql<number>`(
          SELECT COUNT(*) FROM ${teamMembers} m WHERE m.team_id = ${teams.id}
        )`,
      })
      .from(teamMembers)
      .innerJoin(teams, eq(teams.id, teamMembers.teamId))
      .where(eq(teamMembers.userId, session.user.id))
      .orderBy(desc(teams.createdAt))

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      role: row.role,
      createdAt: row.createdAt,
      memberCount: Number(row.memberCount),
      isOwner: row.ownerId === session.user!.id,
    }))
  } catch (err) {
    console.error("[teams] list failed:", err)
    return []
  }
}

/** Members of a team the caller can see. Returns null if they can't. */
export async function getTeamMembers(teamId: string) {
  const session = await auth()
  if (!session?.user?.id) return null

  const membership = await db.query.teamMembers.findFirst({
    where: and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, session.user.id)),
    columns: { id: true },
  })
  if (!membership) return null

  return db
    .select({
      id: teamMembers.id,
      role: teamMembers.role,
      status: teamMembers.status,
      invitedEmail: teamMembers.invitedEmail,
      displayName: profiles.displayName,
      createdAt: teamMembers.createdAt,
    })
    .from(teamMembers)
    .leftJoin(profiles, eq(profiles.id, teamMembers.userId))
    .where(eq(teamMembers.teamId, teamId))
    .orderBy(desc(teamMembers.createdAt))
}

export async function createTeam(
  name: string,
  slug: string
): Promise<ActionResult<{ id: string }>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: "Your session has expired. Sign in again to continue." }
  }

  const trimmedName = (name || "").trim()
  if (!trimmedName) return { ok: false, error: "Give the team a name.", field: "name" }
  if (trimmedName.length > 100) {
    return { ok: false, error: "Team names can be at most 100 characters.", field: "name" }
  }

  const normalisedSlug = (slug || trimmedName)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)

  if (!SLUG.test(normalisedSlug)) {
    return {
      ok: false,
      error: "Slugs use lowercase letters, numbers and hyphens.",
      field: "slug",
    }
  }

  const [owned] = await db
    .select({ value: count() })
    .from(teams)
    .where(eq(teams.ownerId, session.user.id))

  if (Number(owned?.value || 0) >= MAX_TEAMS_PER_OWNER) {
    return { ok: false, error: `You can own at most ${MAX_TEAMS_PER_OWNER} teams.` }
  }

  try {
    // The team and the owner's membership must be created together — a team
    // with no members can't be reached from the UI at all.
    const created = await db.transaction(async (tx) => {
      const [team] = await tx
        .insert(teams)
        .values({ ownerId: session.user!.id!, name: trimmedName, slug: normalisedSlug })
        .returning({ id: teams.id })

      await tx.insert(teamMembers).values({
        teamId: team.id,
        userId: session.user!.id!,
        role: "owner",
        status: "active",
      })

      return team
    })

    revalidatePath("/dashboard/teams")
    return { ok: true, data: created }
  } catch (err) {
    if ((err as { code?: string }).code === "23505") {
      return { ok: false, error: "That slug is already taken.", field: "slug" }
    }
    console.error("[teams] create failed:", err)
    return { ok: false, error: "We couldn't create that team. Please try again." }
  }
}

const inviteSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(254),
  role: z.enum(["admin", "member"]),
})

export interface InviteResult {
  /** True when the invitee already had an account and was added immediately. */
  joinedImmediately: boolean
}

export async function inviteTeamMember(
  teamId: string,
  email: string,
  role: "admin" | "member" = "member"
): Promise<ActionResult<InviteResult>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: "Your session has expired. Sign in again to continue." }
  }

  const parsed = inviteSchema.safeParse({ email, role })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Check the invite details." }
  }

  // Only an owner or admin of *this* team may invite. This check did not exist.
  const membership = await db.query.teamMembers.findFirst({
    where: and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, session.user.id)),
    columns: { role: true },
  })

  if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
    return { ok: false, error: "Only team owners and admins can invite people." }
  }

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, session.user.id),
    columns: { plan: true },
  })
  if (!planFor(profile?.plan).teamCollaboration) {
    return {
      ok: false,
      error: "Team collaboration is available on the Business plan.",
    }
  }

  const [members] = await db
    .select({ value: count() })
    .from(teamMembers)
    .where(eq(teamMembers.teamId, teamId))

  if (Number(members?.value || 0) >= MAX_MEMBERS_PER_TEAM) {
    return { ok: false, error: `Teams can have at most ${MAX_MEMBERS_PER_TEAM} members.` }
  }

  const inviteEmail = parsed.data.email.toLowerCase()

  // Correct lookup: match the *user* table on email.
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, inviteEmail))
    .limit(1)

  if (existingUser) {
    const already = await db.query.teamMembers.findFirst({
      where: and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, existingUser.id)),
      columns: { id: true },
    })
    if (already) {
      return { ok: false, error: "That person is already in this team." }
    }
  }

  await db.insert(teamMembers).values({
    teamId,
    userId: existingUser?.id ?? null,
    invitedEmail: inviteEmail,
    role: parsed.data.role,
    status: existingUser ? "active" : "pending",
  })

  revalidatePath("/dashboard/teams")
  return { ok: true, data: { joinedImmediately: Boolean(existingUser) } }
}

export async function removeTeamMember(
  teamId: string,
  memberId: string
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: "Your session has expired. Sign in again to continue." }
  }

  const membership = await db.query.teamMembers.findFirst({
    where: and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, session.user.id)),
    columns: { role: true },
  })

  if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
    return { ok: false, error: "Only team owners and admins can remove people." }
  }

  const [target] = await db
    .select({ role: teamMembers.role })
    .from(teamMembers)
    .where(and(eq(teamMembers.id, memberId), eq(teamMembers.teamId, teamId)))
    .limit(1)

  if (!target) return { ok: false, error: "That member is no longer in this team." }

  // Removing the owner would orphan the team.
  if (target.role === "owner") {
    return { ok: false, error: "The team owner can't be removed. Delete the team instead." }
  }

  await db
    .delete(teamMembers)
    .where(and(eq(teamMembers.id, memberId), eq(teamMembers.teamId, teamId)))

  revalidatePath("/dashboard/teams")
  return { ok: true, data: undefined }
}

export async function deleteTeam(teamId: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: "Your session has expired. Sign in again to continue." }
  }

  const deleted = await db
    .delete(teams)
    .where(and(eq(teams.id, teamId), eq(teams.ownerId, session.user.id)))
    .returning({ id: teams.id })

  if (deleted.length === 0) {
    return { ok: false, error: "Only the team owner can delete a team." }
  }

  revalidatePath("/dashboard/teams")
  return { ok: true, data: undefined }
}
