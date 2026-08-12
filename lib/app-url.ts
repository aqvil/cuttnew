/**
 * The canonical origin for generated short links.
 *
 * `NEXT_PUBLIC_APP_URL` is inlined at build time, so this resolves identically
 * on the server and in the browser — previously several components each had
 * their own fallback ("https://2s.ms", "http://localhost:3000"), which meant
 * the URL you copied depended on which component rendered it.
 */
export function appOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (configured) return configured.replace(/\/$/, "")
  return "http://localhost:3000"
}

/** Absolute short URL for a code. */
export function shortUrl(code: string): string {
  return `${appOrigin()}/l/${code}`
}

/** The URL encoded into a QR code — the marker lets scans be counted separately. */
export function qrTargetUrl(code: string): string {
  return `${shortUrl(code)}?qr=1`
}

/** Host + path, for compact display. Never use this for navigation. */
export function shortUrlDisplay(code: string): string {
  return `${appOrigin().replace(/^https?:\/\//, "")}/l/${code}`
}
