const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const tailwind = require('@tailwindcss/postcss');

function getFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (item.name !== 'node_modules' && item.name !== '.next') {
        getFiles(fullPath, files);
      }
    } else if (/\.(tsx|ts|jsx|js)$/.test(item.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = [...getFiles('app'), ...getFiles('components')];
console.log(`Scanning ${files.length} files...`);

const classSet = new Set();
// Regex to extract className="..." or className={`...`} or clsx/cn(...)
const classNameRegex = /className=(?:["']([^"']*)["']|{`([^`]*)`})/g;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = classNameRegex.exec(content)) !== null) {
    const raw = match[1] || match[2] || '';
    // extract potential classes (ignore template expressions ${...})
    const cleaned = raw.replace(/\$\{[^}]*\}/g, ' ');
    const tokens = cleaned.split(/\s+/).filter(Boolean);
    for (const t of tokens) {
      // ignore dynamic ternary or special chars
      if (/^[a-zA-Z0-9_\-\/\[\]\:\#\%\.\@\!]+$/.test(t)) {
        classSet.add(t);
      }
    }
  }
}

console.log(`Found ${classSet.size} unique candidate class tokens.`);

async function verifyClasses() {
  const invalid = [];
  const valid = [];
  const testChunkSize = 50;
  const classList = Array.from(classSet);

  for (let i = 0; i < classList.length; i += testChunkSize) {
    const chunk = classList.slice(i, i + testChunkSize);
    for (const cls of chunk) {
      try {
        const css = `@import "tailwindcss";\n.test { @apply ${cls}; }`;
        await postcss([tailwind]).process(css, { from: 't.css' });
        valid.push(cls);
      } catch (err) {
        invalid.push({ cls, error: err.message.split('\n')[0] });
      }
    }
  }

  console.log(`\nValid classes: ${valid.length}`);
  console.log(`Invalid classes: ${invalid.length}`);
  if (invalid.length > 0) {
    console.log('List of invalid classes and reasons:');
    invalid.forEach(inv => console.log(`  - ${inv.cls}: ${inv.error}`));
  }
}

verifyClasses();
