import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

export default NextAuth(authConfig).auth

export const config = {
  /*
   * Only paths that can require a session run through auth middleware.
   *
   * The redirect route `/l/:code` is excluded deliberately: it is the hottest
   * path in the product, needs no session, and previously paid the cost of a
   * JWT decode on every single click. Static assets, the auth API and the
   * public status pages are excluded for the same reason.
   */
  matcher: [
    "/((?!api|_next/static|_next/image|l/|favicon.ico|robots.txt|sitemap.xml|link-expired|link-inactive|link-not-found|link-unavailable|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
