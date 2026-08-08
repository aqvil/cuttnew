import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { QrStudioClient } from "./qr-studio-client"

export default async function QrCodesPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/signin")

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://2s.ms"

  return <QrStudioClient initialUrl={appUrl} />
}
