import { db } from "@/lib/db"
import { surveys, surveyResponses } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import { revalidatePath } from "next/cache"
import crypto from "crypto"

export async function submitSurveyResponse(surveyId: string, formData: FormData) {
  "use server"
  const survey = await db.query.surveys.findFirst({
    where: eq(surveys.id, surveyId),
  })

  if (!survey || !survey.isActive) {
    throw new Error("Survey not available")
  }

  if (survey.maxAnswers && (survey.answerCount || 0) >= survey.maxAnswers) {
    throw new Error("Survey answer capacity reached")
  }

  const answers: Record<string, any> = {}
  formData.forEach((value, key) => {
    if (!key.startsWith("$ACTION")) {
      answers[key] = value
    }
  })

  await db.insert(surveyResponses).values({
    surveyId,
    answers,
    ipHash: crypto.randomBytes(8).toString("hex"),
  })

  await db.update(surveys)
    .set({ answerCount: (survey.answerCount || 0) + 1 })
    .where(eq(surveys.id, surveyId))

  return { success: true }
}

export default async function PublicSurveyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const survey = await db.query.surveys.findFirst({
    where: eq(surveys.id, id),
  })

  if (!survey || !survey.isActive) {
    notFound()
  }

  const questions = (survey.questions as any[]) || []

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-card border border-border rounded-xl p-6 sm:p-8 shadow-xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{survey.title}</h1>
          {survey.description && (
            <p className="text-muted-foreground mt-2 text-sm">{survey.description}</p>
          )}
        </div>

        <form
          action={async (formData) => {
            "use server"
            await submitSurveyResponse(survey.id, formData)
          }}
          className="space-y-6"
        >
          {questions.map((q, idx) => (
            <div key={idx} className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">
                {idx + 1}. {q.label}
              </label>
              {q.type === "text" && (
                <input
                  type="text"
                  name={q.id || `q_${idx}`}
                  required={q.required}
                  placeholder={q.placeholder || "Your answer"}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}
              {q.type === "textarea" && (
                <textarea
                  name={q.id || `q_${idx}`}
                  required={q.required}
                  rows={3}
                  placeholder={q.placeholder || "Your answer"}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}
              {q.type === "choice" && (
                <div className="space-y-2">
                  {(q.options || []).map((opt: string, optIdx: number) => (
                    <label key={optIdx} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                      <input
                        type="radio"
                        name={q.id || `q_${idx}`}
                        value={opt}
                        required={q.required}
                        className="text-primary"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors text-sm shadow-sm"
          >
            Submit Response
          </button>
        </form>
      </div>
    </div>
  )
}
