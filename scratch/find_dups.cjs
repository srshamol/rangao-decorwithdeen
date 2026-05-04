
const fs = require('fs');

const content = fs.readFileSync('f:/rangao-decorwithdeen-main/src/lib/language-context.tsx', 'utf8');

function findDuplicates(sectionName, startStr, endStr) {
  const startIdx = content.indexOf(startStr);
  const endIdx = content.indexOf(endStr, startIdx);
  if (startIdx === -1 || endIdx === -1) {
    console.log(`Could not find section ${sectionName}`);
    return;
  }
  const section = content.substring(startIdx, endIdx);
  const lines = section.split('\n');
  const keys = [];
  lines.forEach(line => {
    const match = line.match(/^\s*["']?([\w-]+)["']?\s*:/);
    if (match) {
      keys.push(match[1]);
    }
  });

  const seen = new Set();
  const dups = new Set();
  keys.forEach(k => {
    if (seen.has(k)) {
      dups.add(k);
    }
    seen.add(k);
  });

  if (dups.size > 0) {
    console.log(`Duplicates in ${sectionName}:`, Array.from(dups));
  } else {
    console.log(`No duplicates in ${sectionName}`);
  }
}

findDuplicates('BN', 'bn: {', '},');
findDuplicates('EN', 'en: {', '},');
