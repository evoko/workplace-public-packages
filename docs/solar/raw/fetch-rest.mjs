// REST-based extractor for the SOLAR Foundations documentation file. Zero model tokens:
// it calls the Figma REST API directly and turns every page into a reading-order JSON of
// its text, tables, swatches and @SOLAR:PAGE_CONTEXT block.
//
//   node docs/solar/raw/fetch-rest.mjs [--file KEY] [--pages slug,slug] [--cache DIR]
//                                      [--out DIR] [--fresh] [--no-sync]
//
// Flow (npm run solar:foundations / solar:sync): reads the file version from Figma, keys the
// response cache by it, syncs _pages.json with the pages that exist in Figma, fetches every
// page, writes raw/<section>/<slug>.json and raw/_meta.json.
// It does NOT read Figma variables (the REST variables endpoint needs an Enterprise-only
// scope); tokens/figma-variables.json stays a deliberate capture. Token: $FIGMA_TOKEN or
// ~/.config/figma/token.
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  rmSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import {
  openFile,
  slugify,
  statusOf,
  cleanTitle,
  writeMeta,
} from '../../_shared/figma-rest.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (k, d) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : d;
};
const FILE = opt('--file', 'Y21OGpk2z6ig9cRMc5cl9L');
const OUT = opt('--out', here);
const CACHE = opt(
  '--cache',
  join(tmpdir(), 'solar-foundations-rest-cache', FILE),
);
const PAGES = opt('--pages', null)?.split(',');
const FRESH = args.includes('--fresh');
const NO_SYNC = args.includes('--no-sync');
const manifestPath = join(here, '_pages.json');
const manifest = existsSync(manifestPath)
  ? JSON.parse(readFileSync(manifestPath, 'utf8'))
  : {
      _note:
        'Manifest of SOLAR Foundations Figma pages, synced by fetch-rest.mjs. section/slug is the output path under raw/ and figma-pages/.',
      file: FILE,
      pages: [],
    };

const file = await openFile(FILE, { cacheRoot: CACHE, fresh: FRESH });
const { version } = file;

// ---------- manifest sync ----------
const TOP = {
  '☰ DOCUMENTATION': 'documentation',
  '◼︎ PRIMITIVES': 'primitives',
};
if (!NO_SYNC) {
  let section = null;
  const seen = new Set();
  const byId = new Map(manifest.pages.map((p) => [p.id, p]));
  let added = 0,
    updated = 0;
  for (const pg of file.pages) {
    const raw = pg.name;
    const name = raw.trim();
    if (name in TOP) {
      section = TOP[name];
      continue;
    }
    if (name === '---' || name === 'Cover' || /^\.\[/.test(name)) continue;
    let sec, title;
    const meta = name.match(/^\[(.+)\]$/);
    if (meta) {
      sec = 'meta';
      title = meta[1];
    } else if (section) {
      sec = section;
      title = cleanTitle(name);
    } else continue;
    const entry = {
      section: sec,
      slug: slugify(title),
      id: pg.id,
      title,
      status: statusOf(name),
      indent: raw.startsWith(' ') ? 1 : 0,
    };
    seen.add(pg.id);
    const cur = byId.get(pg.id);
    if (!cur) {
      manifest.pages.push(entry);
      added++;
      console.log('manifest: added', entry.section + '/' + entry.slug);
    } else {
      const before = JSON.stringify([
        cur.title,
        cur.status,
        cur.indent,
        cur.missingInFigma,
      ]);
      Object.assign(cur, { title, status: entry.status, indent: entry.indent });
      delete cur.missingInFigma;
      if (
        before !==
        JSON.stringify([cur.title, cur.status, cur.indent, cur.missingInFigma])
      ) {
        updated++;
        console.log('manifest: updated', cur.section + '/' + cur.slug);
      }
    }
  }
  for (const p of manifest.pages)
    if (!seen.has(p.id) && !p.missingInFigma) {
      p.missingInFigma = true;
      console.log('manifest: missing in Figma', p.section + '/' + p.slug);
    }
  // keep Figma order
  const order = new Map(file.pages.map((p, i) => [p.id, i]));
  manifest.pages.sort(
    (a, b) => (order.get(a.id) ?? 1e9) - (order.get(b.id) ?? 1e9),
  );
  manifest.file = FILE;
  manifest.lastSync = { version, on: new Date().toISOString().slice(0, 10) };
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(
    `manifest: ${manifest.pages.length} pages, ${added} added, ${updated} updated`,
  );
}

// ---------- transform ----------
const CHROME = new Set(['.Header', '.Footer', 'Footer']);
const hex = (c) =>
  '#' +
  [c.r, c.g, c.b]
    .map((v) =>
      Math.round(v * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('') +
  (c.a !== undefined && c.a < 1
    ? Math.round(c.a * 255)
        .toString(16)
        .padStart(2, '0')
    : '');
const vis = (n) => n.visible !== false;
const yb = (n) => Math.round((n.absoluteBoundingBox?.y || 0) / 24);
const xx = (n) => n.absoluteBoundingBox?.x || 0;
// children in reading order: auto-layout keeps Figma order, free canvas sorts by row then x
const ordered = (n) => {
  const kids = (n.children || []).filter(vis);
  if (n.layoutMode) return kids;
  return kids.slice().sort((a, b) => yb(a) - yb(b) || xx(a) - xx(b));
};
const styleName = (n, styles) =>
  n.styles?.text ? styles[n.styles.text]?.name || null : null;
const textBlock = (n, styles) => {
  const st = styleName(n, styles);
  const s = n.style || {};
  const text = n.characters
    .replace(/\u2028/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
  const h = st && st.match(/Headline\/H(\d)/);
  if (h) return { t: 'h', level: Number(h[1]), text };
  if (st && /\/Code\//.test(st)) return { t: 'code', text };
  const style = st
    ? st.replace(/^\.\[utility\]\//, '')
    : `${s.fontSize}/${s.fontWeight}`;
  return { t: 'p', text, style };
};
const isTextRow = (n) =>
  n.layoutMode === 'HORIZONTAL' &&
  (n.children || []).filter(vis).length >= 2 &&
  (n.children || []).filter(vis).every((c) => c.type === 'TEXT');
const isTable = (n) => {
  const rows = (n.children || []).filter(vis);
  if (rows.length < 2 || !rows.every(isTextRow)) return false;
  const w = rows[0].children.filter(vis).length;
  return rows.every((r) => r.children.filter(vis).length === w);
};
const hasImage = (n) =>
  (n.fills || []).some((f) => f.type === 'IMAGE' && f.visible !== false);

function blocks(n, styles, out, depth) {
  for (const c of ordered(n)) {
    if (c.type === 'TEXT') {
      if (c.characters.trim()) out.push(textBlock(c, styles));
      continue;
    }
    if (CHROME.has(c.name)) continue;
    if (c.name.startsWith('@SOLAR:')) continue;
    if (isTable(c)) {
      out.push({
        t: 'table',
        rows: c.children
          .filter(vis)
          .map((r) => r.children.filter(vis).map((x) => x.characters.trim())),
      });
      continue;
    }
    if (c.type === 'INSTANCE' && c.children) {
      const inner = [];
      blocks(c, styles, inner, depth + 1);
      if (inner.length) out.push({ t: 'group', name: c.name, blocks: inner });
      else if (hasImage(c)) out.push({ t: 'image', name: c.name });
      continue;
    }
    if (hasImage(c)) out.push({ t: 'image', name: c.name });
    if (c.children) blocks(c, styles, out, depth + 1);
  }
}

// swatches: the smallest containers that hold a variable-bound fill and a text label
function swatches(root, out) {
  const boundFill = (n) =>
    n.type === 'TEXT'
      ? null
      : (n.fills || []).find(
          (f) => f.visible !== false && f.boundVariables?.color?.id,
        );
  const texts = (n, acc = []) => {
    if (n.type === 'TEXT' && vis(n)) acc.push(n.characters.trim());
    for (const c of n.children || []) if (vis(c)) texts(c, acc);
    return acc;
  };
  // returns true if a descendant swatch was emitted
  const walk = (n) => {
    if (CHROME.has(n.name) || n.name.startsWith('@SOLAR:')) return false;
    let childHit = false;
    for (const c of n.children || [])
      if (vis(c)) childHit = walk(c) || childHit;
    if (childHit) return true;
    let f = boundFill(n);
    if (!f)
      for (const c of n.children || []) if (vis(c) && (f = boundFill(c))) break;
    if (!f) return false;
    const labels = texts(n);
    if (!labels.length) return false;
    out.push({
      layer: n.name,
      labels,
      variableId: f.boundVariables.color.id,
      hex: f.color ? hex(f.color) : null,
      opacity: f.opacity ?? 1,
    });
    return true;
  };
  walk(root);
}

function transformPage(resp, p) {
  const node = resp.nodes[p.id];
  const styles = node.styles || {};
  const doc = node.document;
  const slides = [];
  let pageContext = null;
  const longestText = (n, best = '') => {
    if (n.type === 'TEXT' && n.characters.length > best.length)
      best = n.characters;
    for (const c of n.children || []) best = longestText(c, best);
    return best;
  };
  for (const top of ordered(doc)) {
    if (top.name.startsWith('@SOLAR:')) {
      const t = longestText(top);
      if (t.length > (pageContext?.length || 0))
        pageContext = t.replace(/\u2028/g, '\n');
      continue;
    }
    const sub =
      (top.children || []).find((c) => c.name === '.Subheader') ||
      (function f(n) {
        for (const c of n.children || []) {
          if (c.name === '.Subheader') return c;
          const r = f(c);
          if (r) return r;
        }
      })(top);
    const subTexts = sub
      ? (sub.children || []).filter((c) => c.type === 'TEXT' && vis(c))
      : [];
    const ph = (t) => (t && !/^(Headline|Subheadline)$/.test(t) ? t : null);
    const title = ph(
      subTexts.find((c) => c.name === 'Headline')?.characters.trim(),
    );
    const subtitle = ph(
      subTexts.find((c) => c.name === 'Subheadline')?.characters.trim(),
    );
    const out = [];
    blocks(top, styles, out, 0);
    // drop subheader texts that were already used as the slide title
    const filtered = out.filter(
      (b) => !(b.t === 'p' && (b.text === title || b.text === subtitle)),
    );
    const bb = top.absoluteBoundingBox || {};
    slides.push({
      name: top.name,
      title,
      subtitle,
      x: Math.round(bb.x || 0),
      y: Math.round(bb.y || 0),
      w: Math.round(bb.width || 0),
      h: Math.round(bb.height || 0),
      blocks: filtered,
    });
  }
  const sw = [];
  swatches(doc, sw);
  const count = (bs) =>
    bs.reduce((n, b) => n + (b.t === 'group' ? count(b.blocks) : 1), 0);
  return {
    page: p.title,
    pageId: p.id,
    section: p.section,
    slug: p.slug,
    status: p.status,
    slides,
    pageContext,
    swatches: sw,
    blockCount: slides.reduce((n, s) => n + count(s.blocks), 0),
  };
}

// ---------- run ----------
let todo = manifest.pages;
if (PAGES) todo = todo.filter((p) => PAGES.includes(p.slug));
let n = 0;
const failed = [];
for (const p of todo) {
  if (p.exclude) {
    const stale = join(OUT, p.section, p.slug + '.json');
    if (existsSync(stale)) {
      rmSync(stale);
      console.log(
        'REMOVED stale raw file of excluded page',
        p.section + '/' + p.slug,
      );
    }
    console.log(
      `SKIP (excluded: ${p.excludeReason || 'no reason given'})`,
      p.section + '/' + p.slug,
    );
    continue;
  }
  if (p.missingInFigma) {
    console.log('SKIP (missing in Figma)', p.section + '/' + p.slug);
    continue;
  }
  let resp;
  try {
    resp = await file.nodes(p.id, p.section + '-' + p.slug);
  } catch (e) {
    console.log(`FAILED ${p.section}/${p.slug}: ${e.message}`);
    failed.push(p.section + '/' + p.slug);
    continue;
  }
  if (!resp.nodes[p.id]) {
    console.log('MISSING', p.section + '/' + p.slug);
    failed.push(p.section + '/' + p.slug);
    continue;
  }
  const doc = transformPage(resp, p);
  const out = join(OUT, p.section, p.slug + '.json');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(doc, null, 2) + '\n');
  console.log(
    `OK ${p.section}/${p.slug} slides=${doc.slides.length} blocks=${doc.blockCount} swatches=${doc.swatches.length}${doc.pageContext ? ' pageContext' : ''}`,
  );
  n++;
}
writeMeta(here, file, { pages: n, failed });
console.log(
  `done: ${n} pages, file version ${version}${failed.length ? `, ${failed.length} FAILED (re-run to retry: ${failed.join(', ')})` : ''}`,
);
if (failed.length) process.exitCode = 2;
