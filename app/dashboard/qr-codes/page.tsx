import { auth } from "@/auth"
import { db } from "@/lib/db"
import { shortLinks } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { redirect } from "next/navigation"
import { QrCodesList } from "./qr-codes-list"

export const metadata = {
  title: "QR Codes",
}

export default async function QrCodesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://2s.ms"

  const userLinks = await db.query.shortLinks.findMany({
    where: eq(shortLinks.userId, session.user.id),
    orderBy: [desc(shortLinks.createdAt)],
  })

  return <QrCodesList links={userLinks} appUrl={appUrl} />
}
