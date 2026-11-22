const fs = require('fs');
const path = require('path');

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
const globalsCss = fs.readFileSync('app/globals.css', 'utf8');

const classUsage = new Map();
const classNameRegex = /className=(?:["']([^"']*)["']|{`([^`]*)`})/g;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = classNameRegex.exec(content)) !== null) {
    const raw = match[1] || match[2] || '';
    const cleaned = raw.replace(/\$\{[^}]*\}/g, ' ');
    const tokens = cleaned.split(/\s+/).filter(Boolean);
    for (const t of tokens) {
      if (/^[a-zA-Z0-9_\-\/\[\]\:\#\%\.\@\!]+$/.test(t)) {
        if (!classUsage.has(t)) classUsage.set(t, []);
        classUsage.get(t).push(file);
      }
    }
  }
}

// Find classes that look custom (do not contain standard tailwind utility patterns)
const customSuspects = [];
for (const [cls, fileList] of classUsage.entries()) {
  // strip pseudo-prefixes like hover:, md:, sm:, focus:
  const base = cls.replace(/^([a-z0-9\-]+:)+/, '');
  
  // if it's not arbitrary [...] and doesn't match standard prefixes:
  if (!base.startsWith('[') && !base.includes(':') && !base.includes('/')) {
    // Check if it's a known Tailwind utility
    // Common tailwind prefixes
    const isStandard = /^(p|m|px|py|pt|pb|pl|pr|mx|my|mt|mb|ml|mr|w|h|min-w|min-h|max-w|max-h|text|bg|border|rounded|shadow|flex|grid|col|row|gap|space|items|justify|content|self|top|bottom|left|right|inset|z|opacity|cursor|overflow|transition|duration|ease|scale|rotate|translate|animate|visible|invisible|static|fixed|absolute|relative|sticky|block|inline|hidden|table|truncate|whitespace|break|select|outline|ring|divide|fill|stroke|font|leading|tracking|align|uppercase|lowercase|capitalize|italic|underline|line-through|aspect|object|order|grow|shrink|basis|blur|brightness|contrast|grayscale|backdrop|origin|pointer-events|resize|list|table|sr-only|not-sr-only)$/.test(base.split('-')[0]);

    if (!isStandard) {
      customSuspects.push({ cls, base, count: fileList.length, file: fileList[0] });
    }
  }
}

console.log('Total suspect custom classes:', customSuspects.length);
customSuspects.forEach(s => {
  const inCss = globalsCss.includes('.' + s.base);
  console.log(`${s.base} (used ${s.count}x, e.g. in ${path.basename(s.file)}) -> in globals.css? ${inCss}`);
});
