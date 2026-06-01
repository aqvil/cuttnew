import { auth } from "@/auth"
import { db } from "@/lib/db"
import { profiles } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
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

  const userId = session.user.id

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, userId),
  })

  return (
    <SessionProvider session={session}>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background text-foreground">
          <DashboardSidebar user={session.user} profile={profile} />
          <SidebarInset className="min-w-0 border-l border-border bg-background">
            <DashboardHeader />
            <main className="relative flex-1 overflow-auto">
              <div className="pointer-events-none absolute inset-0 mono-grid opacity-45" />
              <div className="relative w-full">
                {children}
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </SessionProvider>
  )
}
