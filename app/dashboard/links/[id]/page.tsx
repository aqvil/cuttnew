import { auth } from "@/auth"
import { db } from "@/lib/db"
import { shortLinks } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { notFound, redirect } from "next/navigation"
import { LinkEditor } from "@/components/links/link-editor"

export const metadata = {
  title: "Edit Link",
}

export default async function EditLinkPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const link = await db.query.shortLinks.findFirst({
    where: and(eq(shortLinks.id, id), eq(shortLinks.userId, session.user.id)),
  })

  if (!link) {
    notFound()
  }

  return <LinkEditor link={link} />
}
