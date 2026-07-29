import { Link2, ArrowLeft, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
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
          <p className="font-mono text-5xl font-bold text-foreground">404</p>
          <h1 className="mt-4 text-xl font-bold tracking-tight">Page not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Button className="btn-primary mt-8 w-full" asChild>
            <Link href="/"><ArrowLeft className="size-4" /> Back to home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
