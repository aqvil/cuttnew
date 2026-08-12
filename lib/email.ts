import "server-only"

/**
 * Transactional email.
 *
 * Sending is provider-agnostic and opt-in: set RESEND_API_KEY (and optionally
 * EMAIL_FROM) to deliver real mail. Without it, `sendEmail` reports that no
 * transport is configured and — in development only — logs the message so the
 * password-reset flow can still be exercised locally.
 *
 * Callers must handle `{ ok: false }`. Nothing in the product silently
 * pretends an email was sent.
 */

export interface EmailMessage {
  to: string
  subject: string
  html: string
  text: string
}

export type SendResult = { ok: true } | { ok: false; reason: "unconfigured" | "failed" }

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY)
}

export async function sendEmail(message: EmailMessage): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.info(
        `\n[email] No transport configured. Message that would have been sent:\n` +
          `  To:      ${message.to}\n` +
          `  Subject: ${message.subject}\n` +
          `${message.text.replace(/^/gm, "  ")}\n`
      )
    }
    return { ok: false, reason: "unconfigured" }
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "Cuttly <noreply@cuttly.io>",
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
      signal: AbortSignal.timeout(10_000),
    })

    if (!response.ok) {
      console.error("[email] provider rejected message:", response.status)
      return { ok: false, reason: "failed" }
    }

    return { ok: true }
  } catch (err) {
    console.error("[email] send failed:", err)
    return { ok: false, reason: "failed" }
  }
}

/** Minimal, client-safe HTML wrapper for transactional mail. */
export function emailLayout(heading: string, body: string, cta?: { label: string; url: string }) {
  return `<!doctype html>
<html><body style="margin:0;padding:32px 16px;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#09090b;">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e4e4e7;border-radius:10px;padding:32px;">
    <p style="margin:0 0 24px;font-size:15px;font-weight:600;letter-spacing:-0.01em;">Cuttly</p>
    <h1 style="margin:0 0 12px;font-size:20px;font-weight:600;letter-spacing:-0.02em;">${heading}</h1>
    <div style="font-size:14px;line-height:22px;color:#52525b;">${body}</div>
    ${
      cta
        ? `<p style="margin:28px 0 0;"><a href="${cta.url}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;font-size:14px;font-weight:500;padding:10px 20px;border-radius:8px;">${cta.label}</a></p>
           <p style="margin:20px 0 0;font-size:12px;line-height:18px;color:#a1a1aa;word-break:break-all;">Or paste this link into your browser:<br>${cta.url}</p>`
        : ""
    }
  </div>
</body></html>`
}
