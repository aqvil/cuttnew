import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/app/page-header"
import { QrStudio } from "./qr-studio"
import { getLinkOptions } from "@/lib/qr/queries"
import { appOrigin } from "@/lib/app-url"

export const metadata = { title: "Create QR code" }

/**
 * This route previously didn't exist — the "Create code" button on the QR page
 * linked straight to a 404.
 */
export default async function NewQrCodePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")

  const links = await getLinkOptions(session.user.id)

  return (
    <div className="page">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4 text-muted-foreground">
        <Link href="/dashboard/qr-codes">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to QR codes
        </Link>
      </Button>

      <PageHeader
        title="Create a QR code"
        description="Point a code at one of your short links, so you can change the destination after it's printed."
      />

      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <QrStudio links={links} appOrigin={appOrigin()} />
      </Suspense>
    </div>
  )
}
