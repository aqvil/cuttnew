import { Link2, XCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Link Inactive — Cuttly",
}

export default function LinkInactivePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="fixed inset-0 mono-grid opacity-40 pointer-events-none" />
      <div className="relative w-full max-w-sm text-center">
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-md bg-foreground text-background">
            <Link2 className="size-3.5 stroke-[3]" />
          </span>
          <span className="text-lg font-bold tracking-tight">Cuttly</span>
        </div>
        <div className="dash-panel p-8">
          <div className="dash-icon size-14 mx-auto mb-5">
            <XCircle className="size-5 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Link inactive</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This short link has been disabled by its owner and is no longer redirecting.
          </p>
          <Button className="btn-primary mt-8 w-full" asChild>
            <Link href="/"><ArrowLeft className="size-4" /> Back to home</Link>
          </Button>
        </div>
        <p className="mt-5 text-xs text-muted-foreground">
          Create your own short links at{" "}
          <Link href="/" className="underline hover:text-foreground">cuttly.io</Link>
        </p>
      </div>
    </div>
  )
}
