import { getAdminLinks } from "@/app/actions/admin"
import { AdminLinksClient } from "./links-client"
import { SectionHeader } from "@/components/app/page-header"

export const dynamic = "force-dynamic"
export const metadata = { title: "Admin · Links" }

export default async function AdminLinksPage() {
  const initialData = await getAdminLinks({ page: 1 })

  return (
    <div>
      <SectionHeader
        title="Links"
        description="Every short link on the platform. Disable anything reported for phishing, malware or spam."
      />
      <AdminLinksClient initialData={initialData} />
    </div>
  )
}
