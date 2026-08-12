/**
 * User-agent parsing for click analytics.
 *
 * Deliberately small and dependency-free: this runs on every redirect, so a
 * full UA database would cost more than the data is worth. Order matters —
 * Edge and Opera both claim to be Chrome, Chrome claims to be Safari.
 */

export type DeviceType = "desktop" | "mobile" | "tablet"

export function detectDevice(ua: string): DeviceType {
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua)) return "tablet"
  if (/mobi|iphone|ipod|android|blackberry|iemobile|opera mini/i.test(ua)) return "mobile"
  return "desktop"
}

export function detectBrowser(ua: string): string {
  if (/edg[ea]?\//i.test(ua)) return "Edge"
  if (/opr\/|opera/i.test(ua)) return "Opera"
  if (/samsungbrowser/i.test(ua)) return "Samsung Internet"
  if (/firefox|fxios/i.test(ua)) return "Firefox"
  if (/chrome|crios/i.test(ua)) return "Chrome"
  if (/safari/i.test(ua)) return "Safari"
  return "Other"
}

export function detectOs(ua: string): string {
  if (/windows nt/i.test(ua)) return "Windows"
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS"
  if (/mac os x/i.test(ua)) return "macOS"
  if (/android/i.test(ua)) return "Android"
  if (/cros/i.test(ua)) return "ChromeOS"
  if (/linux/i.test(ua)) return "Linux"
  return "Other"
}

export function isIos(ua: string): boolean {
  return /iphone|ipad|ipod/i.test(ua)
}

export function isAndroid(ua: string): boolean {
  return /android/i.test(ua)
}

/**
 * Crawlers, link previewers and uptime monitors. Their visits still redirect —
 * that's the point of a preview — but they are excluded from analytics so
 * click counts reflect people rather than bots.
 */
const BOT_PATTERN =
  /bot|crawler|spider|crawling|slurp|facebookexternalhit|whatsapp|telegrambot|discordbot|slackbot|twitterbot|linkedinbot|embedly|quora link preview|pinterest|redditbot|applebot|bingpreview|vkshare|w3c_validator|preview|monitor|uptime|curl|wget|python-requests|axios|go-http-client|headlesschrome|lighthouse/i

export function isBot(ua: string): boolean {
  if (!ua) return true // no UA at all is almost always automation
  return BOT_PATTERN.test(ua)
}

/**
 * Two-letter country code from a CDN edge header. Vercel, Cloudflare and
 * common proxies each use their own name; none is guaranteed to be present.
 */
export function detectCountry(headers: Headers): string | null {
  const raw =
    headers.get("x-vercel-ip-country") ||
    headers.get("cf-ipcountry") ||
    headers.get("x-country-code") ||
    headers.get("x-geo-country")

  if (!raw) return null
  const code = raw.trim().toUpperCase()
  // "XX" and "T1" are the placeholders CDNs emit for unknown/Tor traffic.
  if (!/^[A-Z]{2}$/.test(code) || code === "XX" || code === "T1") return null
  return code
}

/** City, when the edge provides it. */
export function detectCity(headers: Headers): string | null {
  const raw = headers.get("x-vercel-ip-city") || headers.get("cf-ipcity")
  if (!raw) return null
  try {
    return decodeURIComponent(raw).slice(0, 80) || null
  } catch {
    return raw.slice(0, 80) || null
  }
}
