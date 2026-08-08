import { getSurveys } from "@/app/actions/surveys"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { SurveysClient } from "./surveys-client"

export default async function SurveysPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/signin")

  const surveys = await getSurveys()

  return <SurveysClient initialSurveys={surveys} />
}
