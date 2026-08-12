'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createSurvey, deleteSurvey } from "@/app/actions/surveys"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ClipboardList,
  Plus,
  ArrowUpRight,
  Trash2,
  Copy,
  Check,
  HelpCircle,
} from "lucide-react"
import { toast } from "sonner"
import { SocialShareModal } from "@/components/ui/social-share-modal"

interface SurveysClientProps {
  initialSurveys: any[]
}

export function SurveysClient({ initialSurveys }: SurveysClientProps) {
  const [surveysList, setSurveysList] = useState(initialSurveys)
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<any[]>([
    { id: "q1", label: "How satisfied are you with our platform?", type: "choice", options: ["Very Satisfied", "Satisfied", "Neutral", "Unsatisfied"], required: true },
    { id: "q2", label: "What features would you like added?", type: "textarea", required: false },
  ])
  const [isCreating, setIsCreating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const router = useRouter()
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"

  const totalAnswers = surveysList.reduce((sum, s) => sum + (s.answerCount || 0), 0)

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `q_${Date.now()}`,
        label: "New Question",
        type: "text",
        required: true,
      },
    ])
  }

  const removeQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx))
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) {
      toast.error("Survey title is required")
      return
    }

    setIsCreating(true)
    try {
      const newSurvey = await createSurvey(title, description, questions)
      setSurveysList([newSurvey, ...surveysList])
      toast.success("Survey created")
      setIsOpen(false)
      setTitle("")
      setDescription("")
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Failed to create survey")
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteSurvey(id)
      setSurveysList(surveysList.filter((s) => s.id !== id))
      toast.success("Survey deleted")
      router.refresh()
    } catch {
      toast.error("Failed to delete survey")
    }
  }

  const handleCopy = (id: string) => {
    const url = `${baseUrl}/s/${id}`
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="page-narrow space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="eyebrow mb-2">Surveys & Polls</div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Surveys & Feedback Studio
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl font-mono">
            Build up to 50 custom surveys and collect up to 5,000 responses with real-time analytics.
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-10 px-4 bg-foreground text-background font-semibold text-xs rounded-md hover:opacity-90 transition-opacity gap-2">
              <Plus className="size-3.5" />
              New Survey
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg border border-border bg-card">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground">Build Survey</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Formulate questions and publish your feedback form.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Title <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="e.g. Customer Feedback 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-10 h-10 text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Description</Label>
                <Textarea
                  placeholder="Brief context..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="text-xs font-mono border-border bg-background"
                />
              </div>

              {/* Questions Builder */}
              <div className="space-y-3 border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold font-mono">Form Questions ({questions.length})</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addQuestion} className="h-7 text-xs font-mono">
                    + Add Question
                  </Button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {questions.map((q, idx) => (
                    <div key={idx} className="bg-muted/40 border border-border p-3 rounded-md space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-semibold text-muted-foreground">Q{idx + 1}</span>
                        <button type="button" onClick={() => removeQuestion(idx)} className="text-muted-foreground hover:text-destructive font-mono">
                          Remove
                        </button>
                      </div>
                      <Input
                        value={q.label}
                        onChange={(e) => {
                          const updated = [...questions]
                          updated[idx].label = e.target.value
                          setQuestions(updated)
                        }}
                        className="h-8 text-xs font-mono bg-card"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)} className="h-9 text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating} size="sm" className="h-9 text-xs bg-foreground text-background font-semibold">
                  {isCreating ? "Creating..." : "Publish Survey"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Monochrome Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="border border-border bg-card p-4 rounded-md space-y-1">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Surveys</p>
          <p className="text-2xl font-bold font-mono text-foreground">{surveysList.length} <span className="text-xs text-muted-foreground font-normal">/ 50</span></p>
        </div>
        <div className="border border-border bg-card p-4 rounded-md space-y-1">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Collected Answers</p>
          <p className="text-2xl font-bold font-mono text-foreground">{totalAnswers.toLocaleString()} <span className="text-xs text-muted-foreground font-normal">/ 5,000</span></p>
        </div>
        <div className="border border-border bg-card p-4 rounded-md space-y-1">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Completion Rate</p>
          <p className="text-2xl font-bold font-mono text-foreground">94.2%</p>
        </div>
        <div className="border border-border bg-card p-4 rounded-md space-y-1">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Capacity Cap</p>
          <p className="text-2xl font-bold font-mono text-foreground">5,000 Answers</p>
        </div>
      </div>

      {/* Surveys List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-muted-foreground uppercase px-1">
          <span>Active Surveys ({surveysList.length})</span>
          <span>Responses</span>
        </div>

        <div className="space-y-2">
          {surveysList.map((s: any) => {
            const surveyUrl = `${baseUrl}/s/${s.id}`
            const pct = Math.min(100, Math.round(((s.answerCount || 0) / 5000) * 100))

            return (
              <div
                key={s.id}
                className="group border border-border bg-card rounded-md p-4 transition-all duration-150 hover:border-foreground/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground text-sm truncate">{s.title}</h3>
                    <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">{(s.questions as any[])?.length || 0} Qs</span>
                  </div>
                  {s.description && (
                    <p className="text-xs text-muted-foreground truncate">{s.description}</p>
                  )}
                  <div className="w-48 h-1 bg-muted rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-foreground transition-all duration-300" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                  <span className="text-xs font-mono font-bold text-foreground">{(s.answerCount || 0).toLocaleString()} / 5,000</span>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleCopy(s.id)}
                    >
                      {copiedId === s.id ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    </Button>

                    <SocialShareModal url={surveyUrl} title={s.title} />

                    <a
                      href={surveyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-foreground hover:underline px-2.5 py-1 rounded bg-muted hover:bg-muted/80 transition-colors"
                    >
                      Open <ArrowUpRight className="size-3" />
                    </a>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(s.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}

          {surveysList.length === 0 && (
            <div className="py-16 text-center border border-dashed border-border rounded-md bg-card">
              <ClipboardList className="size-8 text-muted-foreground/40 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-foreground font-mono">No surveys created</h3>
              <p className="text-xs text-muted-foreground mt-1 font-mono">Build your first survey to collect audience insights.</p>
              <Button onClick={() => setIsOpen(true)} size="sm" className="mt-4 h-9 px-4 text-xs font-semibold bg-foreground text-background">
                <Plus className="mr-1.5 size-3.5" /> Create Survey
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
