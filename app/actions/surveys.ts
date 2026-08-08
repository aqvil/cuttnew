"use server"

import { db } from "@/lib/db"
import { surveys, surveyResponses } from "@/lib/db/schema"
import { auth } from "@/auth"
import { eq, and, count } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getSurveys() {
  const session = await auth()
  if (!session?.user?.id) return []

  return db.query.surveys.findMany({
    where: eq(surveys.userId, session.user.id),
  })
}

export async function createSurvey(
  title: string,
  description?: string,
  questions: any[] = [],
  teamId?: string
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  // Check limit of 50 surveys
  const surveyCount = await db
    .select({ count: count() })
    .from(surveys)
    .where(eq(surveys.userId, session.user.id))

  if ((surveyCount[0]?.count || 0) >= 50) {
    throw new Error("Maximum 50 surveys limit reached.")
  }

  const [newSurvey] = await db
    .insert(surveys)
    .values({
      userId: session.user.id,
      teamId: teamId || null,
      title,
      description,
      questions,
      maxAnswers: 5000,
      answerCount: 0,
      isActive: true,
    })
    .returning()

  revalidatePath("/dashboard/surveys")
  return newSurvey
}

export async function updateSurvey(
  id: string,
  data: {
    title?: string
    description?: string
    questions?: any[]
    isActive?: boolean
  }
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const [updated] = await db
    .update(surveys)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(surveys.id, id), eq(surveys.userId, session.user.id)))
    .returning()

  revalidatePath("/dashboard/surveys")
  return updated
}

export async function deleteSurvey(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await db.delete(surveys).where(and(eq(surveys.id, id), eq(surveys.userId, session.user.id)))
  revalidatePath("/dashboard/surveys")
  return { success: true }
}

export async function getSurveyResponses(surveyId: string) {
  const session = await auth()
  if (!session?.user?.id) return []

  return db.query.surveyResponses.findMany({
    where: eq(surveyResponses.surveyId, surveyId),
  })
}
