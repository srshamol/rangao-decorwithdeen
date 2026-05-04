
const fs = require('fs');

const content = fs.readFileSync('f:/rangao-decorwithdeen-main/src/lib/language-context.tsx', 'utf8');

const lines = content.split('\n');
const bnStartLine = lines.findIndex(l => l.includes('bn: {'));
const enStartLine = lines.findIndex(l => l.includes('en: {'));

function extractObject(startLine) {
  let depth = 0;
  let objLines = [];
  let started = false;
  for (let i = startLine; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('{')) {
      depth++;
      if (!started) {
        started = true;
        continue;
      }
    }
    if (line.includes('}')) {
      depth--;
      if (depth === 0) break;
    }
    objLines.push(line);
  }
  
  const map = new Map();
  objLines.forEach(line => {
    // Match keys with or without quotes, handle values with commas and spaces
    const match = line.match(/^\s*["']?([\w-\s.]+?)["']?\s*:\s*(["'].*?["']|{.*?}|\[.*?\]|[\w.]+)\s*,?\s*$/);
    if (match) {
      const key = match[1];
      const val = match[2];
      map.set(key, val);
    }
  });
  return map;
}

const bnMap = extractObject(bnStartLine);
const enMap = extractObject(enStartLine);

let newContent = content.substring(0, content.indexOf('bn: {') + 5) + '\n';
bnMap.forEach((v, k) => {
  newContent += `    "${k}": ${v},\n`;
});
newContent += '  },\n  en: {\n';
enMap.forEach((v, k) => {
  newContent += `    "${k}": ${v},\n`;
});
newContent += '  }\n};\n\n' + content.substring(content.indexOf('export function LanguageProvider'));

fs.writeFileSync('f:/rangao-decorwithdeen-main/src/lib/language-context.tsx', newContent);
console.log('File cleaned successfully');
