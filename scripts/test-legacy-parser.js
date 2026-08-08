const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'import-legacy.sql');

console.log('Reading file stat...');
const stats = fs.statSync(filePath);
console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

// Simple line-by-line or streaming parser for INSERT INTO statements
const readline = require('readline');
const rl = readline.createInterface({
  input: fs.createReadStream(filePath, { encoding: 'utf8' }),
  crlfDelay: Infinity
});

const counts = {};
let currentTable = null;

rl.on('line', (line) => {
  if (line.startsWith('INSERT INTO ')) {
    const match = line.match(/INSERT INTO [`"']?([a-zA-Z0-9_]+)[`"']?/i);
    if (match) {
      const table = match[1];
      counts[table] = (counts[table] || 0) + 1;
    }
  }
});

rl.on('close', () => {
  console.log('\nINSERT Statement counts by table:');
  console.log(counts);
});
