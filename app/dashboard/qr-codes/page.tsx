import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { QrCodeCard } from "@/components/ui/qr-code-card"

export default async function QrCodesPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/signin")

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://2s.ms"

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">QR Code Studio</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Customize QR codes with custom foreground/background colors, shape styles, and logo overlays.
        </p>
      </div>

      <div className="max-w-2xl">
        <QrCodeCard url={appUrl} fileName="custom-qr-code" />
      </div>
    </div>
  )
}
