// The variable IDs the fetch could not name, and a way to name them.
//
// fetch-rest.mjs writes a binding it has no name for as `{unresolved:<first 12 characters>}` and
// says so at the end ("N UNRESOLVED variable refs"). The REST variables endpoint needs a scope the
// available accounts cannot grant, so the names come from the Figma Plugin API instead, read-only:
//
//   node docs/solar-web/raw/unresolved-ids.mjs            # the full IDs, and the script to name them
//   (run the printed script in the SOLAR Web file, through the Figma MCP `use_figma` tool; save its
//    `resolved` object as a JSON file)
//   node docs/solar-web/raw/unresolved-ids.mjs --add <that file>   # merge it into _variables.json
//   node docs/solar-web/raw/fetch-rest.mjs && node docs/solar-web/build-docs.mjs   # from the cache
//
// The full IDs are read from the REST responses the fetch cached (keyed by the file's version), since
// the raw files keep only the first 12 characters.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const FILE = 'OGvmMNnywH7JWDyEhOzjcc';
const mapPath = join(here, '_variables.json');
const args = process.argv.slice(2);

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );

if (args[0] === '--add') {
  const add = JSON.parse(readFileSync(args[1], 'utf8'));
  const text = readFileSync(mapPath, 'utf8');
  const doc = JSON.parse(text);
  let added = 0;
  for (const [id, name] of Object.entries(add))
    if (!doc.variables[id]) {
      doc.variables[id] = name.replace(/ \[local\]$/, '');
      added++;
    }
  doc.count = Object.keys(doc.variables).length;
  const indent = /\n( +)"/.exec(text)?.[1].length ?? 1;
  writeFileSync(mapPath, JSON.stringify(doc, null, indent) + '\n');
  console.log(`added ${added}, ${doc.count} in all`);
  process.exit(0);
}

const prefixes = new Set();
for (const f of walk(here))
  if (f.endsWith('.json'))
    for (const m of readFileSync(f, 'utf8').matchAll(/unresolved:([0-9a-f]+)/g))
      if (m[1]) prefixes.add(m[1]);
if (!prefixes.size) {
  console.log('every variable reference resolves');
  process.exit(0);
}
const cacheRoot = join(tmpdir(), 'solar-web-rest-cache', FILE);
if (!existsSync(cacheRoot)) {
  console.error(`no REST cache at ${cacheRoot}: run fetch-rest.mjs first`);
  process.exit(1);
}
const version = readdirSync(cacheRoot).sort().at(-1);
const ids = new Set();
for (const f of walk(join(cacheRoot, version)))
  for (const m of readFileSync(f, 'utf8').matchAll(
    /VariableID:([0-9a-f]{12,}\/[0-9]+:[0-9]+)/g,
  ))
    if (prefixes.has(m[1].slice(0, 12))) ids.add(`VariableID:${m[1]}`);
console.log(
  `${prefixes.size} unresolved prefixes, ${ids.size} full IDs (cache ${version}). Run in the SOLAR Web file:\n`,
);
console.log(`const ids = ${JSON.stringify([...ids])};
const resolved = {}; const missing = [];
for (const id of ids) {
  const v = await figma.variables.getVariableByIdAsync(id);
  if (!v) { missing.push(id); continue; }
  const c = await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId);
  resolved[id] = (c ? c.name : '?') + (v.remote ? '' : '(local)') + ':' + v.name;
}
return { resolved, missing };`);
