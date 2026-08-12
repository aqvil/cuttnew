import { getActionPages } from "@/app/actions/action-pages"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { ActionPagesClient } from "./action-pages-client"

export default async function ActionPagesDashboard() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const pages = await getActionPages()

  return <ActionPagesClient initialPages={pages} />
}
