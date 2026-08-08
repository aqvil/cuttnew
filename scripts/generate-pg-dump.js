const fs = require('fs');
const path = require('path');
const readline = require('readline');

const sourcePath = process.argv[2] ? path.resolve(process.argv[2]) : path.join(__dirname, '..', 'import-legacy.sql');
const outputPath = path.join(__dirname, '..', 'scripts', 'import-legacy-pg.sql');

if (!fs.existsSync(sourcePath)) {
  console.error(`Source SQL file not found at ${sourcePath}`);
  console.error(`Usage: node scripts/generate-pg-dump.js [path/to/import-legacy.sql]`);
  process.exit(1);
}

function parseSqlValues(line) {
  const valuesIdx = line.indexOf('VALUES ');
  if (valuesIdx === -1) return [];
  const rawValues = line.substring(valuesIdx + 7).trim().replace(/;$/, '');

  const rows = [];
  let inString = false;
  let escape = false;
  let currentVal = '';
  let currentRow = [];

  for (let i = 0; i < rawValues.length; i++) {
    const char = rawValues[i];

    if (escape) {
      currentVal += char;
      escape = false;
      continue;
    }

    if (char === '\\') {
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

    if (char === '(') {
      currentRow = [];
      currentVal = '';
      continue;
    }

    if (char === ',') {
      currentRow.push(currentVal === 'NULL' ? null : currentVal);
      currentVal = '';
      continue;
    }

    if (char === ')') {
      currentRow.push(currentVal === 'NULL' ? null : currentVal);
      rows.push(currentRow);
      currentVal = '';
      continue;
    }

    currentVal += char;
  }

  return rows;
}

function sqlStr(val) {
  if (val === null || val === undefined || val === 'NULL') return 'NULL';
  const str = String(val).replace(/'/g, "''").replace(/\\/g, '\\\\');
  return `'${str}'`;
}

function sqlDate(val) {
  if (!val || val === 'NULL' || val === '0000-00-00 00:00:00') return 'NULL';
  return sqlStr(val);
}

function sqlBool(val) {
  return (val == 1 || val === '1' || val === true) ? 'true' : 'false';
}

async function generatePgSql() {
  console.log('Generating PostgreSQL import script from import-legacy.sql...');
  const outStream = fs.createWriteStream(outputPath, { encoding: 'utf8' });

  outStream.write(`-- Pure PostgreSQL Import Script for Cuttly Platform
-- Generated from import-legacy.sql
-- Run with: psql $DATABASE_URL -f scripts/import-legacy-pg.sql

BEGIN;

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

`);

  const rl = readline.createInterface({
    input: fs.createReadStream(sourcePath, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  });

  const legacyUserIdMap = new Map(); // legacy_user_id -> pg_user_id
  const legacyLinkIdMap = new Map(); // legacy_link_id -> pg_link_uuid
  const legacyDomainIdMap = new Map(); // legacy_domain_id -> pg_domain_uuid

  const parsedTables = {
    users: [],
    custom_domains: [],
    links: [],
    link_clicks: []
  };

  for await (const line of rl) {
    if (!line.startsWith('INSERT INTO ')) continue;

    for (const tableName of Object.keys(parsedTables)) {
      if (line.startsWith(`INSERT INTO \`${tableName}\``) || line.startsWith(`INSERT INTO "${tableName}"`)) {
        const rows = parseSqlValues(line);
        parsedTables[tableName].push(...rows);
        break;
      }
    }
  }

  // 1. Users
  console.log(`Writing ${parsedTables.users.length} Users & Profiles to SQL...`);
  outStream.write(`-- 1. Insert Users\n`);
  for (const row of parsedTables.users) {
    const legacyId = String(row[0]);
    const pgUserId = `usr_leg_${legacyId}`;
    legacyUserIdMap.set(legacyId, pgUserId);

    const email = row[7] ? String(row[7]).trim().toLowerCase() : `user_${legacyId}@legacy.local`;
    const username = row[1] ? String(row[1]).trim() : null;
    const firstName = row[2] ? String(row[2]).trim() : '';
    const lastName = row[3] ? String(row[3]).trim() : '';
    const fullName = `${firstName} ${lastName}`.trim() || username || email.split('@')[0];
    const password = row[8] ? String(row[8]) : null;
    const avatar = row[20] || row[4] ? String(row[20] || row[4]) : null;
    const stripeId = row[21] ? String(row[21]) : null;
    const emailVerified = sqlDate(row[23]);
    const bannedAt = sqlDate(row[25]);
    const createdAt = sqlDate(row[15]);
    const role = email === 'bogdan@cuttly.io' ? 'superadmin' : 'user';

    outStream.write(`INSERT INTO "user" ("id", "username", "first_name", "last_name", "name", "email", "password", "avatar", "image", "stripe_id", "emailVerified", "banned_at", "role", "created_at", "updated_at")
VALUES (${sqlStr(pgUserId)}, ${sqlStr(username)}, ${sqlStr(firstName)}, ${sqlStr(lastName)}, ${sqlStr(fullName)}, ${sqlStr(email)}, ${sqlStr(password)}, ${sqlStr(avatar)}, ${sqlStr(avatar)}, ${sqlStr(stripeId)}, ${emailVerified}, ${bannedAt}, ${sqlStr(role)}, COALESCE(${createdAt}, NOW()), COALESCE(${createdAt}, NOW()))
ON CONFLICT ("email") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role";\n`);

    outStream.write(`INSERT INTO "profiles" ("id", "username", "display_name", "avatar_url", "stripe_customer_id", "created_at")
VALUES (${sqlStr(pgUserId)}, COALESCE(${sqlStr(username)}, ${sqlStr(`user_${legacyId}`)}), ${sqlStr(fullName)}, ${sqlStr(avatar)}, ${sqlStr(stripeId)}, COALESCE(${createdAt}, NOW()))
ON CONFLICT ("id") DO NOTHING;\n`);
  }

  // 2. Custom Domains
  console.log(`Writing ${parsedTables.custom_domains.length} Custom Domains to SQL...`);
  outStream.write(`\n-- 2. Insert Custom Domains\n`);
  let domainCounter = 1000;
  for (const row of parsedTables.custom_domains) {
    const legacyDomainId = String(row[0]);
    let host = String(row[1] || '').trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (!host) continue;

    const legacyUserId = String(row[2]);
    const pgUserId = legacyUserIdMap.get(legacyUserId) || null;
    const domainUuid = `00000000-0000-4000-8000-${String(domainCounter++).padStart(12, '0')}`;
    legacyDomainIdMap.set(legacyDomainId, domainUuid);
    const createdAt = sqlDate(row[3]);

    outStream.write(`INSERT INTO "custom_domains" ("id", "user_id", "domain", "status", "created_at")
VALUES ('${domainUuid}', ${sqlStr(pgUserId)}, ${sqlStr(host)}, 'active', COALESCE(${createdAt}, NOW()))
ON CONFLICT ("domain") DO NOTHING;\n`);
  }

  // 3. Short Links
  console.log(`Writing ${parsedTables.links.length} Short Links to SQL...`);
  outStream.write(`\n-- 3. Insert Short Links\n`);
  let linkCounter = 1000;
  for (const row of parsedTables.links) {
    const legacyLinkId = String(row[0]);
    const title = row[1] ? String(row[1]) : null;
    const hash = String(row[2] || '').trim();
    const alias = row[3] ? String(row[3]).trim() : null;
    const originalUrl = String(row[4] || '').trim();
    if (!originalUrl || !hash) continue;

    const legacyUserId = row[5] ? String(row[5]) : null;
    const legacyDomainId = row[6] ? String(row[6]) : null;
    const pgUserId = legacyUserId ? legacyUserIdMap.get(legacyUserId) || null : null;
    const pgDomainId = legacyDomainId ? legacyDomainIdMap.get(legacyDomainId) || null : null;

    const password = row[7] ? String(row[7]) : null;
    const isActive = sqlBool(row[8]);
    const expiresAt = sqlDate(row[9]);
    const createdAt = sqlDate(row[13]);
    const clicksCount = parseInt(String(row[20] || '0'), 10) || 0;
    const customSlug = (alias && alias !== hash) ? alias : null;

    const linkUuid = `00000000-0000-4000-9000-${String(linkCounter++).padStart(12, '0')}`;
    legacyLinkIdMap.set(legacyLinkId, linkUuid);

    outStream.write(`INSERT INTO "short_links" ("id", "user_id", "domain_id", "original_url", "short_code", "custom_slug", "title", "password", "is_active", "expires_at", "click_count", "created_at", "updated_at")
VALUES ('${linkUuid}', ${sqlStr(pgUserId)}, ${pgDomainId ? `'${pgDomainId}'` : 'NULL'}, ${sqlStr(originalUrl)}, ${sqlStr(hash)}, ${sqlStr(customSlug)}, ${sqlStr(title)}, ${sqlStr(password)}, ${isActive}, ${expiresAt}, ${clicksCount}, COALESCE(${createdAt}, NOW()), COALESCE(${createdAt}, NOW()))
ON CONFLICT ("short_code") DO UPDATE SET "original_url" = EXCLUDED."original_url", "click_count" = EXCLUDED."click_count";\n`);
  }

  // 4. Link Clicks
  console.log(`Writing ${parsedTables.link_clicks.length} Link Analytics records to SQL...`);
  outStream.write(`\n-- 4. Insert Link Analytics\n`);
  let clickCounter = 100000;
  for (const row of parsedTables.link_clicks) {
    const legacyLinkId = String(row[1]);
    const pgLinkId = legacyLinkIdMap.get(legacyLinkId);
    if (!pgLinkId) continue;

    const os = row[2] ? String(row[2]) : null;
    const device = row[3] ? String(row[3]) : null;
    const browser = row[4] ? String(row[4]) : null;
    const country = row[5] ? String(row[5]) : null;
    const referrer = row[7] ? String(row[7]) : null;
    const ipHash = row[8] ? String(row[8]) : null;
    const createdAt = sqlDate(row[9]);
    const city = row[10] ? String(row[10]) : null;

    outStream.write(`INSERT INTO "link_analytics" ("id", "link_id", "clicked_at", "referrer", "country", "city", "device", "browser", "os", "ip_hash")
VALUES (gen_random_uuid(), '${pgLinkId}', COALESCE(${createdAt}, NOW()), ${sqlStr(referrer)}, ${sqlStr(country)}, ${sqlStr(city)}, ${sqlStr(device)}, ${sqlStr(browser)}, ${sqlStr(os)}, ${sqlStr(ipHash)});\n`);
  }

  outStream.write(`\nCOMMIT;\n`);
  outStream.end();

  console.log(`\n================ GENERATE SUCCESSFUL ================`);
  console.log(`PostgreSQL SQL Script created at: ${outputPath}`);
  console.log(`Run it directly using psql:`);
  console.log(`  psql -U postgres -d cuttnew -f scripts/import-legacy-pg.sql`);
  console.log(`  or: psql $DATABASE_URL -f scripts/import-legacy-pg.sql\n`);
}

generatePgSql().catch(console.error);
