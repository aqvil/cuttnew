const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'import-legacy.sql');
const content = fs.readFileSync(filePath, 'utf8');

const createMatches = content.match(/CREATE TABLE [`"']?([a-zA-Z0-9_]+)[`"']?/gi);
console.log('Tables found in import-legacy.sql:');
if (createMatches) {
  createMatches.forEach(m => console.log(' - ' + m));
} else {
  console.log('No CREATE TABLE found directly, scanning table names...');
}

// Let's also look for INSERT INTO statements
const insertMatches = Array.from(new Set(content.match(/INSERT INTO [`"']?([a-zA-Z0-9_]+)[`"']?/gi)));
console.log('\nTables with INSERT INTO data:');
if (insertMatches) {
  insertMatches.forEach(m => console.log(' - ' + m));
}
