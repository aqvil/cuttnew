import type { ReactNode } from "react"

/**
 * The page itself is a Client Component, which cannot export `metadata`.
 * This layout supplies the title so the tab and share previews are correct.
 */
export const metadata = {
  title: "Reset password",
  description: "Request a password reset link.",
  robots: { index: false, follow: true },
}

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
