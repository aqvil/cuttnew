const fs = require('fs');
const path = require('path');
const readline = require('readline');

const filePath = path.join(__dirname, '..', 'import-legacy.sql');

function parseSqlValues(line) {
  // Finds values part after VALUES
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

const rl = readline.createInterface({
  input: fs.createReadStream(filePath, { encoding: 'utf8' }),
  crlfDelay: Infinity
});

let userCount = 0;
let linkCount = 0;
let clickCount = 0;
let domainCount = 0;

rl.on('line', (line) => {
  if (line.startsWith('INSERT INTO `users`')) {
    const rows = parseSqlValues(line);
    userCount += rows.length;
    console.log('Sample User Row 0:', rows[0]);
  } else if (line.startsWith('INSERT INTO `links`')) {
    const rows = parseSqlValues(line);
    linkCount += rows.length;
    console.log('Sample Link Row 0:', rows[0]);
  } else if (line.startsWith('INSERT INTO `custom_domains`')) {
    const rows = parseSqlValues(line);
    domainCount += rows.length;
    console.log('Sample Domain Row 0:', rows[0]);
  } else if (line.startsWith('INSERT INTO `link_clicks`')) {
    const rows = parseSqlValues(line);
    clickCount += rows.length;
  }
});

rl.on('close', () => {
  console.log('\n--- Extraction Results ---');
  console.log(`Users: ${userCount}`);
  console.log(`Links: ${linkCount}`);
  console.log(`Custom Domains: ${domainCount}`);
  console.log(`Link Clicks: ${clickCount}`);
});
