import { randomInt } from "crypto"

/**
 * Short-code generation and custom-alias validation.
 */

/**
 * Alphabet excludes characters that are easy to confuse when a code is read
 * aloud or copied off a printed QR code: 0/O, 1/l/I.
 */
const ALPHABET = "abcdefghijkmnopqrstuvwxyzACDEFGHJKLMNPQRSTUVWXYZ23456789"

export const MIN_ALIAS_LENGTH = 3
export const MAX_ALIAS_LENGTH = 48

/**
 * Aliases we must never hand out, because they either collide with an
 * application route or would let someone impersonate a system page.
 */
const RESERVED_ALIASES = new Set([
  "api", "app", "admin", "administrator", "auth", "login", "logout", "signin",
  "signup", "sign-up", "sign-in", "register", "dashboard", "settings", "account",
  "billing", "pricing", "plans", "checkout", "help", "support", "contact",
  "about", "blog", "docs", "documentation", "status", "terms", "privacy",
  "legal", "security", "abuse", "report", "l", "s", "p", "a", "q", "qr",
  "qr-codes", "links", "link", "analytics", "stats", "domains", "teams",
  "bio", "static", "public", "assets", "images", "img", "css", "js", "fonts",
  "favicon", "robots", "sitemap", "manifest", "_next", "www", "mail", "email",
  "root", "system", "null", "undefined", "new", "edit", "delete", "create",
  "404", "500", "link-expired", "link-inactive", "unlock", "webhooks",
])

/** Characters allowed in a custom alias. */
const ALIAS_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/

/**
 * Cryptographically random short code. `randomInt` avoids the modulo bias of
 * `Math.random()` and — more importantly — makes codes unguessable, so a
 * private link can't be found by enumerating the keyspace.
 */
export function generateShortCode(length = 7): string {
  let out = ""
  for (let i = 0; i < length; i++) {
    out += ALPHABET[randomInt(ALPHABET.length)]
  }
  return out
}

export type AliasValidation =
  | { ok: true; alias: string }
  | { ok: false; error: string }

/** Validates a user-chosen custom back-half. */
export function validateAlias(input: unknown): AliasValidation {
  if (typeof input !== "string") {
    return { ok: false, error: "Enter a valid custom back-half." }
  }

  const alias = input.trim()

  if (alias.length < MIN_ALIAS_LENGTH) {
    return {
      ok: false,
      error: `Custom back-halves need at least ${MIN_ALIAS_LENGTH} characters.`,
    }
  }

  if (alias.length > MAX_ALIAS_LENGTH) {
    return {
      ok: false,
      error: `Custom back-halves can be at most ${MAX_ALIAS_LENGTH} characters.`,
    }
  }

  if (!ALIAS_PATTERN.test(alias)) {
    return {
      ok: false,
      error: "Use letters, numbers, hyphens and underscores only, starting with a letter or number.",
    }
  }

  if (RESERVED_ALIASES.has(alias.toLowerCase())) {
    return { ok: false, error: `"${alias}" is reserved. Try a different back-half.` }
  }

  return { ok: true, alias }
}

export function isReservedAlias(alias: string): boolean {
  return RESERVED_ALIASES.has(alias.toLowerCase())
}
