import { getUserTeams } from "@/app/actions/teams"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { TeamsClient } from "./teams-client"

export default async function TeamsPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/signin")

  const teams = await getUserTeams()

  return <TeamsClient initialTeams={teams} />
}
