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
  ExternalLink,
  Trash2,
  Copy,
  Check,
  Sparkles,
  HelpCircle,
  BarChart3,
  Users,
  CheckSquare,
  Radio,
  FileText,
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
    { id: "q1", label: "How satisfied are you with our service?", type: "choice", options: ["Very Satisfied", "Satisfied", "Neutral", "Unsatisfied"], required: true },
    { id: "q2", label: "What features would you like to see next?", type: "textarea", required: false },
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
      toast.success("Survey created successfully!")
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
    toast.success("Survey link copied to clipboard")
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="dash-narrow space-y-8">
      {/* Hero Banner */}
      <div className="dash-hero relative overflow-hidden bg-gradient-to-br from-card via-card to-emerald-500/5 border border-border p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 text-left">
            <div className="dash-kicker text-emerald-500 bg-emerald-500/10 border-emerald-500/20">
              <Sparkles className="size-3.5" /> Interactive Polls & Feedback
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Surveys Studio
            </h1>
            <p className="text-sm text-muted-foreground max-w-lg">
              Create up to 50 custom surveys and collect up to 5,000 responses with real-time response analytics.
            </p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="btn-primary gap-2 shadow-lg hover:shadow-xl transition-all font-semibold">
                <Plus className="size-5" />
                Create New Survey
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <ClipboardList className="size-5 text-emerald-500" /> Build Survey
                </DialogTitle>
                <DialogDescription>
                  Formulate questions and publish your interactive survey.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreate} className="space-y-5 pt-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Survey Title <span className="text-destructive">*</span></Label>
                  <Input
                    placeholder="e.g. Customer Satisfaction Survey 2026"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Description / Subtitle</Label>
                  <Textarea
                    placeholder="Tell respondents what this survey is about..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Questions Builder */}
                <div className="space-y-4 border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-bold flex items-center gap-2">
                      <HelpCircle className="size-4 text-emerald-500" /> Form Questions ({questions.length})
                    </Label>
                    <Button type="button" variant="outline" size="sm" onClick={addQuestion} className="gap-1.5 text-xs">
                      <Plus className="size-3.5" /> Add Question
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {questions.map((q, idx) => (
                      <div key={idx} className="bg-muted/40 border border-border p-4 rounded-xl space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-muted-foreground uppercase">Question #{idx + 1}</span>
                          <button type="button" onClick={() => removeQuestion(idx)} className="text-muted-foreground hover:text-destructive text-xs">
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
                          placeholder="Enter question text..."
                          className="bg-card"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating} className="btn-primary">
                    {isCreating ? "Creating..." : "Publish Survey"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Metrics Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="dash-panel p-5 bg-card rounded-xl border border-border">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <ClipboardList className="size-3.5 text-emerald-500" /> Active Surveys
          </p>
          <p className="text-3xl font-extrabold text-foreground mt-2">{surveysList.length} <span className="text-xs text-muted-foreground font-normal">/ 50</span></p>
        </div>
        <div className="dash-panel p-5 bg-card rounded-xl border border-border">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Users className="size-3.5 text-blue-500" /> Total Answers
          </p>
          <p className="text-3xl font-extrabold text-foreground mt-2">{totalAnswers.toLocaleString()} <span className="text-xs text-muted-foreground font-normal">/ 5,000</span></p>
        </div>
        <div className="dash-panel p-5 bg-card rounded-xl border border-border">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <BarChart3 className="size-3.5 text-amber-500" /> Completion Rate
          </p>
          <p className="text-3xl font-extrabold text-foreground mt-2">94.2%</p>
        </div>
        <div className="dash-panel p-5 bg-card rounded-xl border border-border">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <CheckSquare className="size-3.5 text-purple-500" /> Max Capacity
          </p>
          <p className="text-3xl font-extrabold text-foreground mt-2">5,000</p>
        </div>
      </div>

      {/* Surveys Cards List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Active Surveys & Polls</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {surveysList.map((s: any) => {
            const surveyUrl = `${baseUrl}/s/${s.id}`
            const pct = Math.min(100, Math.round(((s.answerCount || 0) / 5000) * 100))

            return (
              <div
                key={s.id}
                className="group relative bg-card border border-border hover:border-emerald-500/40 rounded-2xl p-6 transition-all duration-300 shadow-md hover:shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                        <ClipboardList className="size-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-base group-hover:text-emerald-500 transition-colors line-clamp-1">
                          {s.title}
                        </h3>
                        <p className="text-xs text-muted-foreground font-mono">{(s.questions as any[])?.length || 0} Questions</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      title="Delete survey"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  {s.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {s.description}
                    </p>
                  )}

                  {/* Progress bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">Responses</span>
                      <span className="text-foreground font-mono">{(s.answerCount || 0).toLocaleString()} / 5,000</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-border/80 flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                    Active
                  </span>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleCopy(s.id)}
                      title="Copy Survey Link"
                    >
                      {copiedId === s.id ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                    </Button>

                    <SocialShareModal url={surveyUrl} title={s.title} />

                    <a
                      href={surveyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-500 hover:underline px-2.5 py-1.5 rounded-lg bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors"
                    >
                      Open <ExternalLink className="size-3" />
                    </a>
                  </div>
                </div>
              </div>
            )
          })}

          {surveysList.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-2xl bg-card/50">
              <ClipboardList className="size-12 text-muted-foreground/40 mx-auto mb-3 animate-float" />
              <h3 className="text-lg font-bold text-foreground">No Surveys Created Yet</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Create interactive polls and surveys to capture actionable feedback from your audience.
              </p>
              <Button onClick={() => setIsOpen(true)} className="btn-primary mt-6 gap-2">
                <Plus className="size-4" /> Create First Survey
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
