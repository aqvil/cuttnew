"use server"

import { db } from "@/lib/db"
import { profiles, users } from "@/lib/db/schema"
import { hashPassword } from "@/lib/auth/password"
import { eq } from "drizzle-orm"
import { z } from "zod"

const signUpSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(100),
  email: z.string().trim().email("Enter a valid email address.").max(191),
  password: z.string().min(8, "Password must be at least 8 characters.").max(128),
})

function makeUsername(name: string, id: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")

  return `${base || "user"}_${id.slice(0, 6)}`
}

export async function registerWithEmail(input: unknown) {
  const parsed = signUpSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid sign-up details." }
  }

  const email = parsed.data.email.toLowerCase()
  const [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1)

  if (existingUser) {
    return { ok: false, error: "An account with that email already exists." }
  }

  const id = crypto.randomUUID()
  const password = await hashPassword(parsed.data.password)
  const now = new Date()

  await db.transaction(async (tx) => {
    await tx.insert(users).values({
      id,
      name: parsed.data.name,
      username: makeUsername(parsed.data.name, id),
      email,
      password,
      emailVerified: now,
      createdAt: now,
      updatedAt: now,
    })

    await tx.insert(profiles).values({
      id,
      username: makeUsername(parsed.data.name, id),
      displayName: parsed.data.name,
      createdAt: now,
      updatedAt: now,
    })
  })

  return { ok: true }
}
