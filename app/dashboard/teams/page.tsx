import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { profiles } from "@/lib/db/schema"
import { PageHeader } from "@/components/app/page-header"
import { TeamsClient } from "./teams-client"
import { getUserTeams } from "@/app/actions/teams"
import { planFor } from "@/lib/plans"

export const metadata = { title: "Teams" }

export default async function TeamsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")

  const [profile, teams] = await Promise.all([
    db.query.profiles.findFirst({
      where: eq(profiles.id, session.user.id),
      columns: { plan: true },
    }),
    getUserTeams(),
  ])

  const plan = planFor(profile?.plan)

  return (
    <div className="page">
      <PageHeader
        title="Teams"
        description="Shared workspaces for collaborating on links, with owner, admin and member roles."
      />

      <TeamsClient
        teams={teams}
        canUseTeams={plan.teamCollaboration}
        planName={plan.name}
      />
    </div>
  )
}
