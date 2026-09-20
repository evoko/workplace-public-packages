import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const SECTIONS = [
  'Introduction',
  'Foundations',
  'Styles',
  'Components',
  'Canvas',
  'Assets',
];
const here = fileURLToPath(new URL('..', import.meta.url));
const roots = ['src', '../components/src', '../canvas/src'].map((r) =>
  join(here, r),
);
// The meta object's own `title` property (a top-level property of
// `const meta = {` / `export default {`, so at most two spaces of indent), or
// MDX's `<Meta title="…" />`. Anchoring the indent keeps a nested `title:`
// inside args or parameters from being mistaken for the story's section.
const TITLE = /^[ ]{0,2}title:\s*(['"`])([^'"`]+)\1|title=\s*(['"])([^'"]+)\3/m;

function walk(dir, out) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (name !== 'node_modules') {
        walk(path, out);
      }
    } else if (/\.(stories\.(ts|tsx|js|jsx)|mdx)$/.test(name)) {
      out.push(path);
    }
  }
  return out;
}

const problems = [];
for (const file of roots.flatMap((r) => walk(r, []))) {
  const text = readFileSync(file, 'utf8');
  const match = TITLE.exec(text);
  if (!match) {
    if (file.endsWith('.mdx') && !/<Meta\b/.test(text)) {
      continue;
    }
    problems.push(`${relative(here, file)}: no title found`);
    continue;
  }
  const title = match[2] ?? match[4];
  const section = title.split('/')[0];
  if (!SECTIONS.includes(section)) {
    problems.push(
      `${relative(here, file)}: title "${title}" must start with one of ${SECTIONS.join(', ')}`,
    );
  }
}
if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('story titles ok');
