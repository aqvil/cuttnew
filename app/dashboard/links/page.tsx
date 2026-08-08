import { auth } from "@/auth"
import { db } from "@/lib/db"
import { shortLinks } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { redirect } from "next/navigation"
import { LinksList } from "@/components/links/links-list"

export const metadata = {
  title: "Links - Cuttly",
}

export default async function LinksPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const links = await db.query.shortLinks.findMany({
    where: eq(shortLinks.userId, session.user.id),
    orderBy: [desc(shortLinks.createdAt)],
  })

  return <LinksList links={links} appUrl={process.env.NEXT_PUBLIC_APP_URL || "https://2s.ms"} />
}
