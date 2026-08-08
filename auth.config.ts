import Discord from "next-auth/providers/discord";
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isAuth = nextUrl.pathname.startsWith("/auth");

      if (isDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      } else if (isAuth) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || "user";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        (session.user as any).role = token.role || "user";
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
} satisfies NextAuthConfig;
