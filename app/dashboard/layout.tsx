import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { profiles } from "@/lib/db/schema"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { SessionProvider } from "@/components/auth/session-provider"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  // The shell must render even if this lookup fails — the sidebar only needs
  // it for a display name and plan badge, and a database blip shouldn't take
  // down every page inside the dashboard.
  const profile = await db.query.profiles
    .findFirst({
      where: eq(profiles.id, session.user.id),
      columns: { displayName: true, avatarUrl: true, plan: true },
    })
    .catch((err) => {
      console.error("[dashboard] profile lookup failed:", err)
      return null
    })

  return (
    <SessionProvider session={session}>
      <SidebarProvider>
        <DashboardSidebar user={session.user} profile={profile ?? null} />
        <SidebarInset className="min-w-0 bg-background">
          <DashboardHeader plan={profile?.plan} />
          {/* Skip link: the first thing keyboard users reach on every page. */}
          <a
            href="#main"
            className="sr-only-focusable absolute left-4 top-20 z-50 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
          >
            Skip to content
          </a>
          <main id="main" className="min-w-0 flex-1">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </SessionProvider>
  )
}
