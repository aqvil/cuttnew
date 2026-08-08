// Load env vars safely
const fs = require('fs');
const path = require('path');

try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (!process.env[key]) process.env[key] = value;
      }
    }
  }
}

// We can register tsx/ts-node on the fly or load compiled output
try {
  require('tsx/cjs');
} catch (e) {
  // if tsx isn't installed as package, tsx binary can execute .ts directly
}

const { runLegacySqlImport } = require('../lib/migration/import-sql');

async function main() {
  console.log('Starting legacy SQL migration...');
  const sqlPath = process.argv[2] || path.join(__dirname, '..', 'import-legacy.sql');
  console.log('Target SQL File:', sqlPath);

  try {
    const stats = await runLegacySqlImport(sqlPath);
    console.log('\n================ MIGRATION SUCCESSFUL ================');
    console.log(`Users Imported:   ${stats.usersCount}`);
    console.log(`Links Imported:   ${stats.linksCount}`);
    console.log(`Domains Imported: ${stats.domainsCount}`);
    console.log(`Clicks Logged:    ${stats.clicksCount}`);
    console.log(`Time Elapsed:     ${(stats.durationMs / 1000).toFixed(2)}s`);
    if (stats.errors.length > 0) {
      console.log(`\nWarnings/Errors (${stats.errors.length}):`);
      stats.errors.slice(0, 10).forEach(e => console.log(' - ' + e));
    }
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

main();
