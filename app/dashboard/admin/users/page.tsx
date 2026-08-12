import { getAdminUsers } from "@/app/actions/admin"
import { AdminUsersClient } from "./users-client"
import { SectionHeader } from "@/components/app/page-header"

export const dynamic = "force-dynamic"
export const metadata = { title: "Admin · Users" }

export default async function AdminUsersPage() {
  const initialData = await getAdminUsers({ page: 1 })

  return (
    <div>
      <SectionHeader
        title="Users"
        description="Search accounts, change roles, suspend access, or remove an account entirely."
      />
      <AdminUsersClient initialData={initialData} />
    </div>
  )
}
