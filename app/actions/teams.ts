"use server"

import { db } from "@/lib/db"
import { teams, teamMembers, profiles } from "@/lib/db/schema"
import { auth } from "@/auth"
import { eq, and, count } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getUserTeams() {
  const session = await auth()
  if (!session?.user?.id) return []

  const userTeams = await db.query.teamMembers.findMany({
    where: eq(teamMembers.userId, session.user.id),
    with: {
      team: true,
    },
  })

  return userTeams.map((tm: any) => ({
    ...(tm.team || {}),
    role: tm.role,
  }))
}

export async function createTeam(name: string, slug: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  // Check 10 team limit
  const existingTeamsCount = await db
    .select({ count: count() })
    .from(teams)
    .where(eq(teams.ownerId, session.user.id))

  if ((existingTeamsCount[0]?.count || 0) >= 10) {
    throw new Error("Maximum 10 teams limit reached.")
  }

  const [newTeam] = await db
    .insert(teams)
    .values({
      ownerId: session.user.id,
      name,
      slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
    })
    .returning()

  await db.insert(teamMembers).values({
    teamId: newTeam.id,
    userId: session.user.id,
    role: "owner",
    status: "active",
  })

  revalidatePath("/dashboard/teams")
  return newTeam
}

export async function inviteTeamMember(teamId: string, email: string, role: "admin" | "member" = "member") {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  // Check member count (limit 20 per team)
  const memberCountResult = await db
    .select({ count: count() })
    .from(teamMembers)
    .where(eq(teamMembers.teamId, teamId))

  if ((memberCountResult[0]?.count || 0) >= 20) {
    throw new Error("Maximum 20 members per team limit reached.")
  }

  const [invitedUser] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, email))

  const newMember = await db.insert(teamMembers).values({
    teamId,
    userId: invitedUser ? invitedUser.id : null,
    invitedEmail: email,
    role,
    status: invitedUser ? "active" : "pending",
  }).returning()

  revalidatePath("/dashboard/teams")
  return newMember[0]
}

export async function deleteTeam(teamId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await db.delete(teams).where(and(eq(teams.id, teamId), eq(teams.ownerId, session.user.id)))
  revalidatePath("/dashboard/teams")
  return { success: true }
}
