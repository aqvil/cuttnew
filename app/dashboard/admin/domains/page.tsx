import { getAdminDomains } from "@/app/actions/admin"
import { AdminDomainsClient } from "./domains-admin-client"
import { SectionHeader } from "@/components/app/page-header"

export const dynamic = "force-dynamic"
export const metadata = { title: "Admin · Domains" }

export default async function AdminDomainsPage() {
  const domains = await getAdminDomains()

  return (
    <div>
      <SectionHeader
        title="Domains"
        description="Every custom domain connected to the platform, and who owns it."
      />
      <AdminDomainsClient initialDomains={domains} />
    </div>
  )
}
