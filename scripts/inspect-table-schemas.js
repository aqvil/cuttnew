const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'import-legacy.sql');
const content = fs.readFileSync(filePath, 'utf8');

const regex = new RegExp(`CREATE TABLE \\\`users\\\` \\([\\s\\S]*?\\) ENGINE=`, 'i');
const match = content.match(regex);
if (match) {
  console.log(match[0]);
}
