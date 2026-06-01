import { auth } from "@/auth"
import { db } from "@/lib/db"
import { profiles } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

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
    <SidebarProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        <DashboardSidebar user={session.user} profile={profile} />
        <SidebarInset className="border-l border-border bg-background">
          <DashboardHeader />
          <main className="relative flex-1 overflow-auto">
            <div className="pointer-events-none absolute inset-0 mono-grid opacity-45" />
            <div className="relative">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
