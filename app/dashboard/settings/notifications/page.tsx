import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { profiles } from "@/lib/db/schema"
import { NotificationsForm } from "@/components/settings/notifications-form"

export const metadata = { title: "Notification settings" }

export default async function NotificationSettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, session.user.id),
    columns: { productEmails: true, marketingEmails: true },
  })

  return (
    <NotificationsForm
      productEmails={profile?.productEmails ?? true}
      marketingEmails={profile?.marketingEmails ?? false}
    />
  )
}
