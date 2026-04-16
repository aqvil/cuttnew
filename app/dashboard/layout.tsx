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
        <SidebarInset className="border-l-2 border-border bg-background">
          <DashboardHeader user={session.user} profile={profile} />
          <main className="flex-1 overflow-auto">
            <div className="mx-auto max-w-7xl px-8 py-10">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
