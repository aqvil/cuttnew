import { auth } from "@/auth"
import { db } from "@/lib/db"
import { bioPages, bioBlocks } from "@/lib/db/schema"
import { eq, and, asc } from "drizzle-orm"
import { notFound, redirect } from "next/navigation"
import { BioPageEditor } from "@/components/bio/bio-page-editor"

export const metadata = {
  title: "Edit Bio Segment",
}

export default async function EditBioPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const page = await db.query.bioPages.findFirst({
    where: and(eq(bioPages.id, id), eq(bioPages.userId, session.user.id)),
  })

  if (!page) {
    notFound()
  }

  const blocks = await db.query.bioBlocks.findMany({
    where: eq(bioBlocks.pageId, id),
    orderBy: [asc(bioBlocks.position)],
  })

  return <BioPageEditor page={page} initialBlocks={blocks || []} />
}
