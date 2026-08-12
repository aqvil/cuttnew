import Link from "next/link"
import { redirect } from "next/navigation"
import { Plus } from "lucide-react"

import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/app/page-header"
import { QrCodesList } from "./qr-codes-list"
import { getQrCodes } from "@/lib/qr/queries"
import { appOrigin } from "@/lib/app-url"

export const metadata = { title: "QR codes" }

export default async function QrCodesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")

  const codes = await getQrCodes(session.user.id)

  return (
    <div className="page">
      <PageHeader
        title="QR codes"
        description="Scannable codes for your short links. Scans are counted separately from clicks."
        actions={
          <Button asChild>
            <Link href="/dashboard/qr-codes/new">
              <Plus className="size-4" aria-hidden="true" />
              Create QR code
            </Link>
          </Button>
        }
      />

      <QrCodesList codes={codes} appOrigin={appOrigin()} />
    </div>
  )
}
