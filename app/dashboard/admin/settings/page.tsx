import { getAdminSettings } from "@/app/actions/admin"
import { AdminSettingsClient } from "./settings-client"
import { SectionHeader } from "@/components/app/page-header"

export const dynamic = "force-dynamic"
export const metadata = { title: "Admin · Settings" }

export default async function AdminSettingsPage() {
  const settings = await getAdminSettings()

  return (
    <div>
      <SectionHeader
        title="Platform settings"
        description="Defaults that apply to every account: signup access, link caps and maintenance mode."
      />
      <AdminSettingsClient initialSettings={settings} />
    </div>
  )
}
