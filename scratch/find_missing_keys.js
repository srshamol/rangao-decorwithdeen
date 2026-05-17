import fs from 'fs';
import path from 'path';

const SRC_DIR = 'f:/rangao-decorwithdeen-main/src';
const LANG_FILE = 'f:/rangao-decorwithdeen-main/src/lib/language-context.tsx';

function findTranslationKeys(dir) {
    let keys = new Set();
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            const subKeys = findTranslationKeys(fullPath);
            subKeys.forEach(k => keys.add(k));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const matches = content.matchAll(/t\("([^"]+)"\)/g);
            for (const match of matches) {
                keys.add(match[1]);
            }
        }
    }
    return keys;
}

function getExistingKeys(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const keys = new Set();
    // Simple regex to find keys in the translations object
    const matches = content.matchAll(/"([^"]+)":/g);
    for (const match of matches) {
        keys.add(match[1]);
    }
    return keys;
}

const usedKeys = findTranslationKeys(SRC_DIR);
const existingKeys = getExistingKeys(LANG_FILE);

const missing = [];
usedKeys.forEach(key => {
    if (!existingKeys.has(key)) {
        missing.push(key);
    }
});

console.log("Missing keys:");
console.log(JSON.stringify(missing, null, 2));
