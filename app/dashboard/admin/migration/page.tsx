import { AdminMigrationClient } from "./migration-client"
import { SectionHeader } from "@/components/app/page-header"

export const dynamic = "force-dynamic"
export const metadata = { title: "Admin · Migration" }

export default async function AdminMigrationPage() {
  return (
    <div>
      <SectionHeader
        title="Legacy import"
        description="Import a legacy MySQL/MariaDB export containing users, links, domains and click history."
      />
      <AdminMigrationClient />
    </div>
  )
}
