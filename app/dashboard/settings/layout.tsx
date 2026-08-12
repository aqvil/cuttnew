import type { ReactNode } from "react"
import { SettingsNav } from "@/components/settings/settings-nav"
import { PageHeader } from "@/components/app/page-header"

/**
 * Settings shell.
 *
 * The previous settings page put every group in one column with a sidebar of
 * buttons that were purely decorative — none of them navigated anywhere. Each
 * entry here is a real route with its own page.
 */
export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="page">
      <PageHeader
        title="Settings"
        description="Manage your profile, security, notifications and API access."
      />

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <SettingsNav />
        <div className="min-w-0 flex-1 pb-12 lg:max-w-2xl">{children}</div>
      </div>
    </div>
  )
}
