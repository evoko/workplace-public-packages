// Usage: node docs/solar-web/raw/_assemble.mjs <section>/<slug>
// Concatenates docs/solar-web/raw/_parts/<slug>.<n>.txt (n = 0,1,2,...) in order,
// validates JSON, pretty-prints to docs/solar-web/raw/<section>/<slug>.json, removes parts.
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  unlinkSync,
  mkdirSync,
  existsSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const target = process.argv[2];
if (!target || !target.includes('/')) {
  console.error('usage: _assemble.mjs <section>/<slug>');
  process.exit(2);
}
const slug = target.split('/').pop();
const parts = readdirSync(join(here, '_parts'))
  .filter((f) => f.startsWith(slug + '.') && f.endsWith('.txt'))
  .map((f) => ({ f, n: Number(f.slice(slug.length + 1, -4)) }))
  .filter((p) => Number.isInteger(p.n))
  .sort((a, b) => a.n - b.n);
if (!parts.length) {
  console.error('no parts for ' + slug);
  process.exit(2);
}
for (let i = 0; i < parts.length; i++)
  if (parts[i].n !== i) {
    console.error('missing part ' + i + ' for ' + slug);
    process.exit(2);
  }
// JSON.stringify output never contains raw newlines, so trailing newlines added by editors are safe to strip.
const raw = parts
  .map((p) =>
    readFileSync(join(here, '_parts', p.f), 'utf8').replace(/[\r\n]+$/, ''),
  )
  .join('');
let data;
try {
  data = JSON.parse(raw);
} catch (e) {
  console.error(
    'invalid JSON for ' +
      slug +
      ': ' +
      e.message +
      ' (length ' +
      raw.length +
      ')',
  );
  process.exit(1);
}
const out = join(here, target + '.json');
if (!existsSync(dirname(out))) mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(data, null, 2) + '\n');
for (const p of parts) unlinkSync(join(here, '_parts', p.f));
console.log(
  'OK ' +
    target +
    '.json  sets=' +
    data.componentSets.length +
    ' components=' +
    data.components.length +
    ' frames=' +
    data.frames.length +
    ' docText=' +
    data.docText.length +
    ' bytes=' +
    raw.length,
);
