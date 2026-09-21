// Usage: node docs/solar-web/raw/_assemble2.mjs <batchName>
// Joins _parts/<batchName>.<n>.txt, expands the compact v2 payload back to the v1
// per-page shape, and writes raw/<section>/<slug>.json for every page in the batch.
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
const batch = process.argv[2];
if (!batch) {
  console.error('usage: _assemble2.mjs <batchName>');
  process.exit(2);
}
const parts = readdirSync(join(here, '_parts'))
  .filter((f) => f.startsWith(batch + '.') && f.endsWith('.txt'))
  .map((f) => ({ f, n: Number(f.slice(batch.length + 1, -4)) }))
  .filter((p) => Number.isInteger(p.n))
  .sort((a, b) => a.n - b.n);
if (!parts.length) {
  console.error('no parts for ' + batch);
  process.exit(2);
}
for (let i = 0; i < parts.length; i++)
  if (parts[i].n !== i) {
    console.error('missing part ' + i);
    process.exit(2);
  }
const raw = parts
  .map((p) =>
    readFileSync(join(here, '_parts', p.f), 'utf8').replace(/[\r\n]+$/, ''),
  )
  .join('');
let payload;
try {
  payload = JSON.parse(raw);
} catch (e) {
  console.error('invalid JSON: ' + e.message + ' (len ' + raw.length + ')');
  process.exit(1);
}
const CX = {
  C: 'Color',
  S: 'Spatial',
  T: 'Type',
  P: 'Primitives',
  L: 'Layout',
};
const un = (s) =>
  typeof s === 'string'
    ? s.replace(/\{([A-Za-z ]+):/g, (m, c) => '{' + (CX[c] || c) + ':')
    : s;
const unArr = (a) => (Array.isArray(a) ? a.map(un) : a);
const unVars = (v) => {
  if (!v) return undefined;
  const o = {};
  for (const [k, x] of Object.entries(v))
    o[k] = Array.isArray(x)
      ? x.map((y) => un('{' + y + '}').slice(1, -1))
      : un('{' + x + '}').slice(1, -1);
  return o;
};
const DIR = { H: 'HORIZONTAL', V: 'VERTICAL', G: 'GRID' };
function node(o) {
  const r = { name: o.n, type: o.t };
  if (o.h) r.hidden = true;
  if (o.m) r.main = o.m;
  if (o.vr) r.variant = o.vr;
  if (o.tx !== undefined) r.text = o.tx;
  if (o.ts) r.textStyle = o.ts;
  r.size = o.sz;
  if (o.ly)
    r.layout = {
      dir: DIR[o.ly[0]] || o.ly[0],
      gap: o.ly[1],
      pad: o.ly[2],
      align: o.ly[3],
      sizing: o.ly[4],
    };
  else if (o.sg) r.sizing = o.sg;
  if (o.f) r.fills = unArr(o.f);
  if (o.st) {
    r.strokes = unArr(o.st);
    r.strokeWeight = o.sw;
  }
  if (o.r !== undefined) r.radius = o.r;
  if (o.es) r.effectStyle = o.es;
  if (o.o !== undefined) r.opacity = o.o;
  if (o.v) r.vars = unVars(o.v);
  if (o.pr) r.propRefs = o.pr;
  if (o.c) r.children = o.c.map(node);
  return r;
}
const props = (p) =>
  Object.fromEntries(
    Object.entries(p || {}).map(([k, v]) => [
      k,
      { type: v.t, default: v.d, options: v.o },
    ]),
  );
function digest(d, base) {
  const src = base
    ? {
        ...base,
        ...Object.fromEntries(Object.entries(d).filter(([k, v]) => v !== null)),
      }
    : d;
  for (const k of Object.keys(d)) if (d[k] === null) delete src[k];
  const r = { variant: d.vr, size: src.sz };
  if (src.f) r.fills = unArr(src.f);
  if (src.st) r.strokes = unArr(src.st);
  if (src.e) r.effect = src.e;
  if (src.o !== undefined) r.opacity = src.o;
  if (src.tf) r.textFills = unArr(src.tf);
  if (src.if) r.iconFills = unArr(src.if);
  if (src.h) r.hidden = src.h;
  return r;
}
let n = 0;
for (const P of payload.pages) {
  const sets = P.sets.map((S) => {
    const base = S.va[0];
    const o = {
      name: S.n,
      id: S.i,
      description: S.d,
      docLinks: S.dl,
      variantCount: S.vc,
      props: props(S.p),
      defaultVariant: S.dv,
      defaultVariantNodeCount: S.dvn,
      defaultVariantTree: node(S.tr),
      variants: S.va.map((v, i) => digest(v, i ? base : null)),
    };
    if (S.cs) o.census = S.cs;
    if (S.vt) o.variantsTruncated = true;
    return o;
  });
  const comps = P.comps.map((C) => {
    const o = {
      name: C.n,
      id: C.i,
      description: C.d,
      props: props(C.p),
      nodeCount: C.nc,
      tree: node(C.tr),
    };
    if (C.cs) o.census = C.cs;
    return o;
  });
  const frames = P.frames.map((F) => {
    const o = { name: F.n, type: F.t, id: F.i, size: F.sz };
    if (F.m) o.main = F.m;
    if (F.vr) o.variant = F.vr;
    if (F.cs) o.census = F.cs;
    if (F.tr) o.tree = node(F.tr);
    if (F.tx) o.texts = F.tx;
    return o;
  });
  const doc = {
    page: P.page,
    pageId: P.pageId,
    componentSets: sets,
    components: comps,
    frames,
    docText: P.doc,
    pageContext: P.ctx,
  };
  const out = join(here, P.out + '.json');
  if (!existsSync(dirname(out))) mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(doc, null, 2) + '\n');
  console.log(
    `OK ${P.out} sets=${sets.length} components=${comps.length} frames=${frames.length} docText=${P.doc.length}`,
  );
  n++;
}
for (const p of parts) unlinkSync(join(here, '_parts', p.f));
console.log(`batch ${batch}: ${n} pages, ${raw.length} bytes`);
