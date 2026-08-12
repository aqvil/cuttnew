import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/app/page-header"
import { CreateLinkForm } from "@/components/links/create-link-form"
import { getLinkQuota } from "@/app/actions/links"
import { appOrigin } from "@/lib/app-url"

export const metadata = { title: "Create link" }

export default async function NewLinkPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")

  const quota = await getLinkQuota()

  return (
    <div className="page-narrow">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4 text-muted-foreground">
        <Link href="/dashboard/links">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to links
        </Link>
      </Button>

      <PageHeader
        title="Create a short link"
        description="Paste a URL and you're done. Everything else is optional."
      />

      {/* useSearchParams inside the form needs a Suspense boundary. */}
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <CreateLinkForm appOrigin={appOrigin()} quota={quota} />
      </Suspense>
    </div>
  )
}
