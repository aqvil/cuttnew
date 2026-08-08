import fs from "fs";
import path from "path";
import readline from "readline";
import { db } from "@/lib/db";
import {
  users,
  profiles,
  shortLinks,
  customDomains,
  teams,
  teamMembers,
  retargetingPixels,
  linkAnalytics,
} from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";

interface ImportStats {
  usersCount: number;
  linksCount: number;
  domainsCount: number;
  teamsCount: number;
  pixelsCount: number;
  clicksCount: number;
  durationMs: number;
  errors: string[];
}

function parseSqlValues(line: string): any[][] {
  const valuesIdx = line.indexOf("VALUES ");
  if (valuesIdx === -1) return [];
  const rawValues = line.substring(valuesIdx + 7).trim().replace(/;$/, "");

  const rows: any[][] = [];
  let inString: string | false = false;
  let escape = false;
  let currentVal = "";
  let currentRow: any[] = [];

  for (let i = 0; i < rawValues.length; i++) {
    const char = rawValues[i];

    if (escape) {
      currentVal += char;
      escape = false;
      continue;
    }

    if (char === "\\") {
      escape = true;
      continue;
    }

    if (char === "'" || char === '"') {
      if (!inString) {
        inString = char;
      } else if (inString === char) {
        inString = false;
      } else {
        currentVal += char;
      }
      continue;
    }

    if (inString) {
      currentVal += char;
      continue;
    }

    if (char === "(") {
      currentRow = [];
      currentVal = "";
      continue;
    }

    if (char === ",") {
      currentRow.push(currentVal === "NULL" ? null : currentVal);
      currentVal = "";
      continue;
    }

    if (char === ")") {
      currentRow.push(currentVal === "NULL" ? null : currentVal);
      rows.push(currentRow);
      currentVal = "";
      continue;
    }

    currentVal += char;
  }

  return rows;
}

function safeDate(val: any): Date | null {
  if (!val || val === "NULL" || val === "0000-00-00 00:00:00") return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

export async function runLegacySqlImport(sqlFilePath?: string): Promise<ImportStats> {
  const startTime = Date.now();
  const targetPath = sqlFilePath || path.join(process.cwd(), "import-legacy.sql");

  if (!fs.existsSync(targetPath)) {
    throw new Error(`Legacy SQL file not found at path: ${targetPath}`);
  }

  const stats: ImportStats = {
    usersCount: 0,
    linksCount: 0,
    domainsCount: 0,
    teamsCount: 0,
    pixelsCount: 0,
    clicksCount: 0,
    durationMs: 0,
    errors: [],
  };

  const userIdMap = new Map<string, string>(); // legacy numeric user_id -> string user_id
  const linkIdMap = new Map<string, string>(); // legacy numeric link_id -> uuid shortLink id
  const domainIdMap = new Map<string, string>(); // legacy numeric domain_id -> uuid customDomain id

  const rl = readline.createInterface({
    input: fs.createReadStream(targetPath, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });

  const parsedTables: Record<string, any[][]> = {
    users: [],
    links: [],
    custom_domains: [],
    workspaces: [],
    workspace_user: [],
    tracking_pixels: [],
    link_clicks: [],
  };

  for await (const line of rl) {
    if (!line.startsWith("INSERT INTO ")) continue;

    for (const tableName of Object.keys(parsedTables)) {
      if (line.startsWith(`INSERT INTO \`${tableName}\``) || line.startsWith(`INSERT INTO "${tableName}"`)) {
        const rows = parseSqlValues(line);
        parsedTables[tableName].push(...rows);
        break;
      }
    }
  }

  // 1. Process Users
  console.log(`[Import] Processing ${parsedTables.users.length} users...`);
  for (const row of parsedTables.users) {
    // Columns: id(0), username(1), first_name(2), last_name(3), avatar_url(4), gender(5), legacy_permissions(6), email(7), password(8), ..., created_at(15), updated_at(16), language(17), country(18), timezone(19), avatar(20), stripe_id(21), ..., email_verified_at(23), ..., banned_at(25)
    try {
      const legacyId = String(row[0]);
      const email = String(row[7] || `user_${legacyId}@legacy.local`).trim().toLowerCase();
      const username = row[1] ? String(row[1]).trim() : null;
      const firstName = row[2] ? String(row[2]).trim() : "";
      const lastName = row[3] ? String(row[3]).trim() : "";
      const fullName = `${firstName} ${lastName}`.trim() || username || email.split("@")[0];
      const password = row[8] ? String(row[8]) : null;
      const avatar = row[20] || row[4] ? String(row[20] || row[4]) : null;
      const stripeId = row[21] ? String(row[21]) : null;
      const emailVerified = safeDate(row[23]);
      const bannedAt = safeDate(row[25]);
      const createdAt = safeDate(row[15]) || new Date();

      const newUserId = `usr_leg_${legacyId}`;
      userIdMap.set(legacyId, newUserId);

      // Upsert User
      await db
        .insert(users)
        .values({
          id: newUserId,
          username,
          firstName,
          lastName,
          name: fullName,
          email,
          password,
          avatar,
          image: avatar,
          stripeId,
          emailVerified,
          bannedAt,
          role: email === "bogdan@cuttly.io" ? "superadmin" : "user",
          createdAt,
          updatedAt: createdAt,
        })
        .onConflictDoUpdate({
          target: users.email,
          set: {
            password: password || undefined,
            name: fullName,
            bannedAt: bannedAt || undefined,
          },
        });

      // Upsert Profile
      await db
        .insert(profiles)
        .values({
          id: newUserId,
          username: username || `user_${legacyId}`,
          displayName: fullName,
          avatarUrl: avatar,
          stripeCustomerId: stripeId,
          createdAt,
        })
        .onConflictDoNothing();

      stats.usersCount++;
    } catch (err: any) {
      stats.errors.push(`User error (ID ${row[0]}): ${err.message}`);
    }
  }

  // 2. Process Custom Domains
  console.log(`[Import] Processing ${parsedTables.custom_domains.length} custom domains...`);
  for (const row of parsedTables.custom_domains) {
    // Columns: id(0), host(1), user_id(2), created_at(3)
    try {
      const legacyId = String(row[0]);
      let host = String(row[1] || "").trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
      const legacyUserId = String(row[2]);
      const mappedUserId = userIdMap.get(legacyUserId);
      const createdAt = safeDate(row[3]) || new Date();

      if (!host) continue;

      const [domainRecord] = await db
        .insert(customDomains)
        .values({
          userId: mappedUserId,
          domain: host,
          status: "active",
          createdAt,
        })
        .onConflictDoNothing()
        .returning({ id: customDomains.id });

      if (domainRecord) {
        domainIdMap.set(legacyId, domainRecord.id);
      }
      stats.domainsCount++;
    } catch (err: any) {
      stats.errors.push(`Domain error (ID ${row[0]}): ${err.message}`);
    }
  }

  // 3. Process Links
  console.log(`[Import] Processing ${parsedTables.links.length} links...`);
  for (const row of parsedTables.links) {
    // Columns: id(0), name(1), hash(2), alias(3), long_url(4), user_id(5), domain_id(6), password(7), active(8), expires_at(9), description(10), type(11), type_id(12), created_at(13), updated_at(14), deleted_at(15), workspace_id(16), thumbnail(17), image(18), clicked_at(19), clicks_count(20)
    try {
      const legacyId = String(row[0]);
      const title = row[1] ? String(row[1]) : null;
      const hash = String(row[2] || "").trim();
      const alias = row[3] ? String(row[3]).trim() : null;
      const originalUrl = String(row[4] || "").trim();
      const legacyUserId = row[5] ? String(row[5]) : null;
      const legacyDomainId = row[6] ? String(row[6]) : null;
      const password = row[7] ? String(row[7]) : null;
      const isActive = row[8] == 1 || row[8] === "1" || row[8] === true;
      const expiresAt = safeDate(row[9]);
      const createdAt = safeDate(row[13]) || new Date();
      const clicksCount = row[20] ? parseInt(String(row[20]), 10) || 0 : 0;

      if (!originalUrl || !hash) continue;

      const mappedUserId = legacyUserId ? userIdMap.get(legacyUserId) : undefined;
      const mappedDomainId = legacyDomainId ? domainIdMap.get(legacyDomainId) : undefined;
      const shortCode = hash;
      const customSlug = alias && alias !== hash ? alias : null;

      const [linkRecord] = await db
        .insert(shortLinks)
        .values({
          userId: mappedUserId,
          domainId: mappedDomainId,
          originalUrl,
          shortCode,
          customSlug,
          title,
          password,
          isActive,
          expiresAt,
          clickCount: clicksCount,
          createdAt,
          updatedAt: createdAt,
        })
        .onConflictDoUpdate({
          target: shortLinks.shortCode,
          set: {
            originalUrl,
            clickCount: clicksCount,
            isActive,
          },
        })
        .returning({ id: shortLinks.id });

      if (linkRecord) {
        linkIdMap.set(legacyId, linkRecord.id);
      }
      stats.linksCount++;
    } catch (err: any) {
      stats.errors.push(`Link error (ID ${row[0]}): ${err.message}`);
    }
  }

  // 4. Process Link Clicks (Chunked Batch Inserts)
  console.log(`[Import] Processing ${parsedTables.link_clicks.length} link click analytics...`);
  const clickBatch: any[] = [];
  const BATCH_SIZE = 2000;

  for (const row of parsedTables.link_clicks) {
    // Columns: id(0), linkeable_id(1), platform(2), device(3), browser(4), location(5), crawler(6), referrer(7), ip(8), created_at(9), city(10), state(11)
    try {
      const legacyLinkId = String(row[1]);
      const mappedLinkId = linkIdMap.get(legacyLinkId);
      if (!mappedLinkId) continue;

      const os = row[2] ? String(row[2]) : null;
      const device = row[3] ? String(row[3]) : null;
      const browser = row[4] ? String(row[4]) : null;
      const country = row[5] ? String(row[5]) : null;
      const referrer = row[7] ? String(row[7]) : null;
      const ipHash = row[8] ? String(row[8]) : null;
      const createdAt = safeDate(row[9]) || new Date();
      const city = row[10] ? String(row[10]) : null;

      clickBatch.push({
        linkId: mappedLinkId,
        clickedAt: createdAt,
        referrer,
        country,
        city,
        device,
        browser,
        os,
        ipHash,
      });

      if (clickBatch.length >= BATCH_SIZE) {
        await db.insert(linkAnalytics).values(clickBatch);
        stats.clicksCount += clickBatch.length;
        clickBatch.length = 0;
      }
    } catch (err: any) {
      // ignore individual click insertion errors to complete migration
    }
  }

  if (clickBatch.length > 0) {
    await db.insert(linkAnalytics).values(clickBatch);
    stats.clicksCount += clickBatch.length;
  }

  stats.durationMs = Date.now() - startTime;
  console.log(`[Import Complete] Imported ${stats.usersCount} users, ${stats.linksCount} links, ${stats.clicksCount} clicks in ${stats.durationMs}ms`);

  return stats;
}
