import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { profiles } from "@/lib/db/schema"
import { ProfileForm } from "@/components/settings/profile-form"

export const metadata = { title: "Profile settings" }

export default async function ProfileSettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, session.user.id),
    columns: { displayName: true, username: true, bio: true },
  })

  return (
    <ProfileForm
      profile={{
        displayName: profile?.displayName ?? session.user.name ?? "",
        username: profile?.username ?? "",
        bio: profile?.bio ?? "",
      }}
      email={session.user.email ?? null}
    />
  )
}
