import { getSurveys } from "@/app/actions/surveys"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { ClipboardList, Plus, ExternalLink, BarChart2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function SurveysPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/signin")

  const surveys = await getSurveys()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Surveys & Polls</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Build up to 50 surveys and collect up to 5,000 answers.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="size-4" />
          Create Survey
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {surveys.map((s: any) => (
          <div key={s.id} className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
            <div>
              <h3 className="font-semibold text-foreground text-base">{s.title}</h3>
              {s.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{s.description}</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                {(s.answerCount || 0).toLocaleString()} / 5,000 answers
              </span>
              <a
                href={`/s/${s.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1 font-medium"
              >
                View <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        ))}

        {surveys.length === 0 && (
          <div className="col-span-full py-16 text-center border border-dashed border-border rounded-xl">
            <ClipboardList className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="text-base font-semibold text-foreground">No surveys created yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Create customizable interactive surveys and collect up to 5,000 answers.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
