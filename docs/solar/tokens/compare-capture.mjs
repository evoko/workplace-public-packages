// Semantic comparison of a fresh capture (output of capture-variables.js, assembled from its
// slices) against figma-variables.json. Ignores key order, the "source" block's file name and
// dates, and the "_"-prefixed format notes; reports every token whose value differs, and
// tokens present on one side only.
//   node docs/solar/tokens/compare-capture.mjs <capture.json | dir-of-slices>
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const arg = process.argv[2];
if (!arg) {
  console.error(
    'usage: compare-capture.mjs <capture.json | dir of slice files {total,off,text}>',
  );
  process.exit(1);
}
let text;
if (statSync(arg).isDirectory()) {
  const slices = readdirSync(arg)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(readFileSync(join(arg, f), 'utf8')))
    .sort((a, b) => a.off - b.off);
  text = slices.map((s) => s.text).join('');
  if (text.length !== slices[0].total)
    throw new Error(
      `slices cover ${text.length} of ${slices[0].total} chars; a slice is missing`,
    );
} else text = readFileSync(arg, 'utf8');
const fresh = JSON.parse(text);
const ref = JSON.parse(
  readFileSync(join(here, 'figma-variables.json'), 'utf8'),
);

// numeric formatting is not a difference: 0.20 == 0.2, +8% == 8%
const norm = (s) =>
  s
    .replace(/(\d)\.(\d*?)0+(?=[^\d])/g, (m, a, b) => (b ? `${a}.${b}` : a))
    .replace(/"\+(\d)/g, '"$1');
const flat = (o, prefix = '', out = {}) => {
  for (const [k, v] of Object.entries(o)) {
    if (k.startsWith('_') || k.startsWith('$')) continue;
    const p = prefix ? prefix + '.' + k : k;
    if (v && typeof v === 'object' && !Array.isArray(v) && !('hex' in v))
      flat(v, p, out);
    else out[p] = norm(JSON.stringify(v));
  }
  return out;
};
const sections = [
  'primitives',
  'color',
  'spatial',
  'type',
  'textStyles',
  'effectStyles',
];
let diffs = 0;
for (const s of sections) {
  const a = flat(ref[s] || {}),
    b = flat(fresh[s] || {});
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const changed = [],
    onlyRef = [],
    onlyFresh = [];
  for (const k of keys) {
    if (!(k in a)) onlyFresh.push(k);
    else if (!(k in b)) onlyRef.push(k);
    else if (a[k] !== b[k]) changed.push(`${k}: ${a[k]} -> ${b[k]}`);
  }
  diffs += changed.length + onlyRef.length + onlyFresh.length;
  console.log(
    `${s}: ${Object.keys(a).length} in JSON, ${Object.keys(b).length} in capture, ${changed.length} changed, ${onlyRef.length} only in JSON, ${onlyFresh.length} only in capture`,
  );
  for (const x of changed.slice(0, 40)) console.log('  changed  ' + x);
  for (const x of onlyRef.slice(0, 40)) console.log('  only JSON    ' + x);
  for (const x of onlyFresh.slice(0, 40)) console.log('  only capture ' + x);
}
const rc = ref.source.collections,
  fc = fresh.source.collections;
for (const c of Object.keys({ ...rc, ...fc }))
  if (JSON.stringify(rc[c]) !== JSON.stringify(fc[c])) {
    diffs++;
    console.log(
      `collection ${c}: ${JSON.stringify(rc[c])} -> ${JSON.stringify(fc[c])}`,
    );
  }
console.log(diffs ? `${diffs} differences` : 'identical (semantically)');
process.exitCode = diffs ? 1 : 0;
