import type { ReactNode } from "react"

/**
 * The page itself is a Client Component, which cannot export `metadata`.
 * This layout supplies the title so the tab and share previews are correct.
 */
export const metadata = {
  title: "Create account",
  description: "Create a free Cuttly account.",
  robots: { index: false, follow: true },
}

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
