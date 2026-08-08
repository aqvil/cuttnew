import { getCustomDomains, getGlobalTrackingHeaders } from "@/app/actions/domains"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { DomainsClient } from "./domains-client"

export default async function DomainsPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/signin")

  const domains = await getCustomDomains()
  const globalHeaders = await getGlobalTrackingHeaders()

  return <DomainsClient initialDomains={domains} initialGlobalHeaders={globalHeaders} />
}
