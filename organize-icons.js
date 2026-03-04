#!/usr/bin/env node
/**
 * Organizes icon files into subfolders based on variant type and viewBox size.
 * Run with: node organize-icons.js
 */

const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, 'packages/assets/src/icons');

// ViewBox → folder mapping
const VIEWBOX_FOLDER_MAP = {
  '0 0 6 6': 'icons_xxxxs',
  '0 0 8 8': 'icons_xxxs',
  '0 0 12 12': 'icons_xxs',
  '0 0 16 16': 'icons_xs',
  '0 0 20 20': 'icons_sm',
  '0 0 24 24': 'icons_md',
  '0 0 32 32': 'icons_lg',
  '0 0 40 40': 'icons_xl',
  '0 0 56 56': 'icons_xxl',
  '0 0 72 72': 'icons_xxxl',
};

// Get all .tsx files at root of icons dir
const allFiles = fs.readdirSync(ICONS_DIR).filter(f => f.endsWith('.tsx'));

const results = {
  multisize: [],
  sized: {},
  root: [],
  errors: [],
};

for (const file of allFiles) {
  const filePath = path.join(ICONS_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');

  if (content.includes('variantMap')) {
    results.multisize.push(file);
    continue;
  }

  // Extract viewBox
  const viewBoxMatch = content.match(/viewBox="([^"]+)"/);
  if (!viewBoxMatch) {
    results.root.push(file);
    continue;
  }

  const viewBox = viewBoxMatch[1];
  const folder = VIEWBOX_FOLDER_MAP[viewBox];
  if (folder) {
    if (!results.sized[folder]) results.sized[folder] = [];
    results.sized[folder].push(file);
  } else {
    results.root.push(file);
  }
}

// Print summary before moving
console.log(`\n=== Classification Summary ===`);
console.log(`icons_multisize: ${results.multisize.length}`);
for (const [folder, files] of Object.entries(results.sized)) {
  console.log(`${folder}: ${files.length}`);
}
console.log(`root (staying): ${results.root.length}`);
console.log(`  → ${results.root.join(', ')}`);

// Move multisize icons
const multisizeDir = path.join(ICONS_DIR, 'icons_multisize');
for (const file of results.multisize) {
  fs.renameSync(path.join(ICONS_DIR, file), path.join(multisizeDir, file));
}
console.log(`\nMoved ${results.multisize.length} files to icons_multisize/`);

// Move sized icons
for (const [folder, files] of Object.entries(results.sized)) {
  const targetDir = path.join(ICONS_DIR, folder);
  for (const file of files) {
    fs.renameSync(path.join(ICONS_DIR, file), path.join(targetDir, file));
  }
  console.log(`Moved ${files.length} files to ${folder}/`);
}

// Regenerate index.ts
console.log(`\nRegenerating index.ts...`);

const exportLines = [];

// Collect all moved files with their new paths
for (const file of results.multisize) {
  const name = file.replace('.tsx', '');
  exportLines.push(`export { ${name} } from './icons_multisize/${name}';`);
}

for (const [folder, files] of Object.entries(results.sized)) {
  for (const file of files) {
    const name = file.replace('.tsx', '');
    exportLines.push(`export { ${name} } from './${folder}/${name}';`);
  }
}

for (const file of results.root) {
  const name = file.replace('.tsx', '');
  exportLines.push(`export { ${name} } from './${name}';`);
}

// Sort alphabetically
exportLines.sort((a, b) => {
  const nameA = a.match(/\{ (\w+) \}/)[1];
  const nameB = b.match(/\{ (\w+) \}/)[1];
  return nameA.localeCompare(nameB);
});

const indexContent = exportLines.join('\n') + '\n';
fs.writeFileSync(path.join(ICONS_DIR, 'index.ts'), indexContent);
console.log(`Written index.ts with ${exportLines.length} exports.`);
console.log(`\nDone!`);
