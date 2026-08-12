"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { qrCodes, shortLinks } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import type { ActionResult } from "./links"

/**
 * QR codes are stored objects, not throwaway images.
 *
 * A code always points at a short link rather than a raw destination, which is
 * the whole reason to use one: a printed code can be re-pointed later by
 * editing the link. Scans are attributed via the `?qr=1` marker the encoded URL
 * carries, so "N scans" on the QR page is a real number.
 */

const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/
const ERROR_LEVELS = new Set(["L", "M", "Q", "H"])

export interface QrCodeInput {
  linkId: string
  title?: string | null
  foregroundColor?: string
  backgroundColor?: string
  logoUrl?: string | null
  errorCorrection?: string
}

function validateDesign(input: QrCodeInput): { ok: true } | { ok: false; error: string } {
  for (const [value, label] of [
    [input.foregroundColor, "Foreground colour"],
    [input.backgroundColor, "Background colour"],
  ] as const) {
    if (value !== undefined && !HEX_COLOR.test(value)) {
      return { ok: false, error: `${label} must be a hex value like #1a1a1a.` }
    }
  }

  if (input.errorCorrection !== undefined && !ERROR_LEVELS.has(input.errorCorrection)) {
    return { ok: false, error: "Choose an error-correction level of L, M, Q or H." }
  }

  if (input.logoUrl) {
    // Only same-origin paths and https URLs. A data: URI here would be drawn
    // onto a canvas the user then downloads, and an http: URL would break the
    // page's mixed-content guarantees.
    const isRelative = input.logoUrl.startsWith("/")
    const isHttps = /^https:\/\//i.test(input.logoUrl)
    if (!isRelative && !isHttps) {
      return { ok: false, error: "Logo must be an https:// URL or a path on this site." }
    }
    if (input.logoUrl.length > 1024) {
      return { ok: false, error: "That logo URL is too long." }
    }
  }

  return { ok: true }
}

export async function createQrCode(
  input: QrCodeInput
): Promise<ActionResult<{ id: string }>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: "Your session has expired. Sign in again to continue." }
  }

  const design = validateDesign(input)
  if (!design.ok) return { ok: false, error: design.error }

  // The link must belong to the caller — otherwise anyone could mint a QR code
  // for someone else's link and read its scan numbers.
  const link = await db.query.shortLinks.findFirst({
    where: and(eq(shortLinks.id, input.linkId), eq(shortLinks.userId, session.user.id)),
    columns: { id: true, title: true },
  })

  if (!link) {
    return { ok: false, error: "Choose a link that belongs to your account." }
  }

  const [created] = await db
    .insert(qrCodes)
    .values({
      userId: session.user.id,
      linkId: link.id,
      title: input.title?.trim().slice(0, 200) || link.title || null,
      foregroundColor: input.foregroundColor || "#000000",
      backgroundColor: input.backgroundColor || "#ffffff",
      logoUrl: input.logoUrl || null,
      errorCorrection: input.errorCorrection || "M",
    })
    .returning({ id: qrCodes.id })

  revalidatePath("/dashboard/qr-codes")
  revalidatePath(`/dashboard/links/${link.id}`)
  return { ok: true, data: created }
}

export async function updateQrCode(
  id: string,
  input: Omit<QrCodeInput, "linkId">
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: "Your session has expired. Sign in again to continue." }
  }

  const design = validateDesign({ ...input, linkId: "" })
  if (!design.ok) return { ok: false, error: design.error }

  const patch: Record<string, unknown> = { updatedAt: new Date() }
  if (input.title !== undefined) patch.title = input.title?.trim().slice(0, 200) || null
  if (input.foregroundColor !== undefined) patch.foregroundColor = input.foregroundColor
  if (input.backgroundColor !== undefined) patch.backgroundColor = input.backgroundColor
  if (input.logoUrl !== undefined) patch.logoUrl = input.logoUrl || null
  if (input.errorCorrection !== undefined) patch.errorCorrection = input.errorCorrection

  const updated = await db
    .update(qrCodes)
    .set(patch)
    .where(and(eq(qrCodes.id, id), eq(qrCodes.userId, session.user.id)))
    .returning({ id: qrCodes.id })

  if (updated.length === 0) {
    return { ok: false, error: "That QR code no longer exists, or you don't have access to it." }
  }

  revalidatePath("/dashboard/qr-codes")
  return { ok: true, data: undefined }
}

export async function deleteQrCode(id: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: "Your session has expired. Sign in again to continue." }
  }

  const deleted = await db
    .delete(qrCodes)
    .where(and(eq(qrCodes.id, id), eq(qrCodes.userId, session.user.id)))
    .returning({ id: qrCodes.id })

  if (deleted.length === 0) {
    return { ok: false, error: "That QR code no longer exists, or you don't have access to it." }
  }

  revalidatePath("/dashboard/qr-codes")
  return { ok: true, data: undefined }
}
