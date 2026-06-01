import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { profiles, users } from "@/lib/db/schema";
import { verifyPassword } from "@/lib/auth/password";
import { authConfig } from "./auth.config";
import { eq } from "drizzle-orm";

async function ensureProfile(user: { id: string; name?: string | null; email?: string | null; image?: string | null }) {
  const displayName = user.name || user.email?.split("@")[0] || "User";

  await db
    .insert(profiles)
    .values({
      id: user.id,
      username: `${displayName.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")}_${user.id.slice(0, 6)}`,
      displayName,
      avatarUrl: user.image,
    })
    .onConflictDoNothing();
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email || "").trim().toLowerCase();
        const password = String(credentials?.password || "");

        if (!email || !password) return null;

        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!user || user.bannedAt) return null;

        const isValid = await verifyPassword(password, user.password);
        if (!isValid) return null;

        await ensureProfile(user);

        return {
          id: user.id,
          name: user.name || user.username || user.email?.split("@")[0],
          email: user.email,
          image: user.image || user.avatarUrl || user.avatar,
        };
      },
    }),
  ],
  events: {
    async createUser({ user }) {
      if (user.id) {
        await ensureProfile({
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        });
      }
    },
  },
});
