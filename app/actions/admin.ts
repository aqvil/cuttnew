"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  users,
  profiles,
  shortLinks,
  customDomains,
  linkAnalytics,
  surveys,
  actionPages,
  systemSettings,
} from "@/lib/db/schema";
import { runLegacySqlImport } from "@/lib/migration/import-sql";
import { eq, ilike, or, count, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Authorises an administrative action.
 *
 * The role is read from the database on every call, not trusted from the JWT —
 * a token issued before a demotion must not keep working. The previous
 * implementation also promoted two hardcoded email addresses to superadmin,
 * which meant anyone who registered with one of those addresses on a fresh
 * deployment gained full platform control. That backdoor is gone; bootstrap is
 * now controlled by the SUPERADMIN_EMAILS environment variable (see auth.ts).
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Authentication required");
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { role: true, bannedAt: true },
  });

  if (dbUser?.bannedAt) {
    throw new Error("Unauthorized: Account suspended");
  }

  if (dbUser?.role !== "admin" && dbUser?.role !== "superadmin") {
    throw new Error("Unauthorized: Admin privileges required");
  }

  return { ...session.user, role: dbUser.role };
}

/** Non-throwing variant for route guards. */
export async function isAdmin(): Promise<boolean> {
  try {
    await requireAdmin();
    return true;
  } catch {
    return false;
  }
}

export async function getAdminOverviewStats() {
  await requireAdmin();

  const [[{ count: usersCount }], [{ count: linksCount }], [{ count: domainsCount }], [{ count: bannedCount }]] =
    await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(shortLinks),
      db.select({ count: count() }).from(customDomains),
      db.select({ count: count() }).from(users).where(sql`${users.bannedAt} IS NOT NULL`),
    ]);

  const [{ count: clicksCount }] = await db.select({ count: count() }).from(linkAnalytics);

  const recentUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      bannedAt: users.bannedAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(5);

  const recentLinks = await db
    .select({
      id: shortLinks.id,
      shortCode: shortLinks.shortCode,
      originalUrl: shortLinks.originalUrl,
      clickCount: shortLinks.clickCount,
      isActive: shortLinks.isActive,
      createdAt: shortLinks.createdAt,
    })
    .from(shortLinks)
    .orderBy(desc(shortLinks.createdAt))
    .limit(5);

  return {
    totalUsers: Number(usersCount),
    totalLinks: Number(linksCount),
    totalClicks: Number(clicksCount),
    totalDomains: Number(domainsCount),
    bannedUsers: Number(bannedCount),
    recentUsers,
    recentLinks,
  };
}

export async function getAdminUsers({
  page = 1,
  query = "",
  role,
}: {
  page?: number;
  query?: string;
  role?: string;
}) {
  await requireAdmin();

  const limit = 15;
  const offset = (page - 1) * limit;

  let whereConditions = [];
  if (query) {
    whereConditions.push(
      or(ilike(users.email, `%${query}%`), ilike(users.name, `%${query}%`), ilike(users.username, `%${query}%`))
    );
  }
  if (role) {
    whereConditions.push(eq(users.role, role as any));
  }

  const whereClause = whereConditions.length > 0 ? sql.join(whereConditions, sql` AND `) : undefined;

  const [usersList, [{ count: totalCount }]] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        username: users.username,
        role: users.role,
        image: users.image,
        bannedAt: users.bannedAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset),

    db.select({ count: count() }).from(users).where(whereClause),
  ]);

  return {
    users: usersList,
    total: Number(totalCount),
    totalPages: Math.ceil(Number(totalCount) / limit),
    page,
  };
}

/**
 * Guards an action taken against another account.
 *
 * Three rules, none of which existed before:
 *  - You cannot act on yourself. Otherwise an admin can ban or delete their
 *    own account by accident, or demote the last superadmin.
 *  - An admin cannot act on a superadmin. Otherwise "admin" is effectively
 *    equal to "superadmin", since one could demote the other and take over.
 *  - Only a superadmin can grant or revoke elevated roles.
 */
async function guardTargetUser(targetUserId: string, actor: { id?: string; role?: string }) {
  if (targetUserId === actor.id) {
    throw new Error("You can't perform this action on your own account.");
  }

  const target = await db.query.users.findFirst({
    where: eq(users.id, targetUserId),
    columns: { id: true, role: true },
  });

  if (!target) throw new Error("That account no longer exists.");

  if (target.role === "superadmin" && actor.role !== "superadmin") {
    throw new Error("Only a superadmin can manage another superadmin.");
  }

  return target;
}

export async function updateUserRoleAction(
  targetUserId: string,
  newRole: "user" | "admin" | "superadmin"
) {
  const actor = await requireAdmin();
  await guardTargetUser(targetUserId, actor);

  if (newRole !== "user" && actor.role !== "superadmin") {
    throw new Error("Only a superadmin can grant elevated roles.");
  }

  await db.update(users).set({ role: newRole, updatedAt: new Date() }).where(eq(users.id, targetUserId));
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/users");
  return { success: true };
}

export async function toggleUserBanAction(targetUserId: string, ban: boolean) {
  const actor = await requireAdmin();
  await guardTargetUser(targetUserId, actor);

  await db
    .update(users)
    .set({ bannedAt: ban ? new Date() : null, updatedAt: new Date() })
    .where(eq(users.id, targetUserId));

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/users");
  return { success: true };
}

export async function deleteUserAdminAction(targetUserId: string) {
  const actor = await requireAdmin();
  await guardTargetUser(targetUserId, actor);

  if (actor.role !== "superadmin") {
    throw new Error("Only a superadmin can permanently delete an account.");
  }

  await db.delete(users).where(eq(users.id, targetUserId));
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/users");
  return { success: true };
}

export async function getAdminLinks({
  page = 1,
  query = "",
}: {
  page?: number;
  query?: string;
}) {
  await requireAdmin();

  const limit = 15;
  const offset = (page - 1) * limit;

  let whereClause = undefined;
  if (query) {
    whereClause = or(
      ilike(shortLinks.shortCode, `%${query}%`),
      ilike(shortLinks.originalUrl, `%${query}%`),
      ilike(shortLinks.title, `%${query}%`)
    );
  }

  const [linksList, [{ count: totalCount }]] = await Promise.all([
    db
      .select({
        id: shortLinks.id,
        shortCode: shortLinks.shortCode,
        customSlug: shortLinks.customSlug,
        originalUrl: shortLinks.originalUrl,
        title: shortLinks.title,
        clickCount: shortLinks.clickCount,
        isActive: shortLinks.isActive,
        expiresAt: shortLinks.expiresAt,
        createdAt: shortLinks.createdAt,
        userId: shortLinks.userId,
      })
      .from(shortLinks)
      .where(whereClause)
      .orderBy(desc(shortLinks.createdAt))
      .limit(limit)
      .offset(offset),

    db.select({ count: count() }).from(shortLinks).where(whereClause),
  ]);

  return {
    links: linksList,
    total: Number(totalCount),
    totalPages: Math.ceil(Number(totalCount) / limit),
    page,
  };
}

export async function toggleLinkActiveAdminAction(linkId: string, isActive: boolean) {
  await requireAdmin();

  await db.update(shortLinks).set({ isActive }).where(eq(shortLinks.id, linkId));
  revalidatePath("/dashboard/admin/links");
  return { success: true };
}

export async function deleteLinkAdminAction(linkId: string) {
  await requireAdmin();

  await db.delete(shortLinks).where(eq(shortLinks.id, linkId));
  revalidatePath("/dashboard/admin/links");
  return { success: true };
}

export async function getAdminDomains() {
  await requireAdmin();

  const domainsList = await db
    .select({
      id: customDomains.id,
      domain: customDomains.domain,
      status: customDomains.status,
      verifiedAt: customDomains.verifiedAt,
      createdAt: customDomains.createdAt,
      userId: customDomains.userId,
    })
    .from(customDomains)
    .orderBy(desc(customDomains.createdAt));

  return domainsList;
}

export async function deleteDomainAdminAction(domainId: string) {
  await requireAdmin();

  await db.delete(customDomains).where(eq(customDomains.id, domainId));
  revalidatePath("/dashboard/admin/domains");
  return { success: true };
}

export async function getAdminSettings() {
  await requireAdmin();

  const settingsRows = await db.select().from(systemSettings);
  const settingsMap: Record<string, any> = {
    appName: "Cuttly",
    allowSignups: true,
    maintenanceMode: false,
    maxFreeLinks: 50,
    defaultDomain: "2s.ms",
  };

  settingsRows.forEach((row) => {
    settingsMap[row.key] = row.value;
  });

  return settingsMap;
}

export async function updateAdminSettingAction(key: string, value: any) {
  await requireAdmin();

  await db
    .insert(systemSettings)
    .values({
      key,
      value,
    })
    .onConflictDoUpdate({
      target: systemSettings.key,
      set: {
        value,
        updatedAt: new Date(),
      },
    });

  revalidatePath("/dashboard/admin/settings");
  return { success: true };
}

export async function triggerLegacyMigrationAction(customSqlPath?: string) {
  await requireAdmin();

  try {
    const stats = await runLegacySqlImport(customSqlPath);
    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/admin/users");
    revalidatePath("/dashboard/admin/links");
    return { success: true, stats };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
