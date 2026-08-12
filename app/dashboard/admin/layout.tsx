import type { ReactNode } from "react"
import { notFound } from "next/navigation"
import { isAdmin } from "@/app/actions/admin"
import { AdminNav } from "@/components/admin/admin-nav"
import { PageHeader } from "@/components/app/page-header"

/**
 * Route-level guard for the admin console.
 *
 * Individual actions already check authorisation, but without this the pages
 * themselves rendered for anyone and only failed once an action threw — which
 * showed a non-admin an error screen instead of nothing at all. `notFound()`
 * rather than a redirect, so the console's existence isn't confirmed to
 * someone probing for it.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  if (!(await isAdmin())) notFound()

  return (
    <div className="page-wide">
      <PageHeader
        title="Admin console"
        description="Platform-wide user, link and domain administration."
      />
      <AdminNav />
      <div className="mt-8">{children}</div>
    </div>
  )
}
