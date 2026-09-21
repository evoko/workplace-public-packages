// REST-based extractor for the SOLAR Icons library. Zero model tokens.
//
//   node docs/solar-icons/raw/fetch-rest.mjs [--file KEY] [--pages slug,slug] [--cache DIR]
//                                            [--out DIR] [--fresh] [--no-sync] [--no-assets]
//
// Flow (npm run solar:icons / solar:sync): reads the file version, keys the response and asset
// cache by it, syncs _pages.json with the category pages in Figma, writes one JSON per page
// (every icon set with its outline/solid variant ids, size and fill binding), exports every
// icon variant as SVG into ../svg/{outline,solid}/<kebab-name>.svg and the Logos page into
// ../logos/, and writes _meta.json. --no-assets skips the SVG/PNG export.
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  rmSync,
  readdirSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import {
  figmaGet,
  openFile,
  slugify,
  cleanTitle,
  writeMeta,
} from '../../_shared/figma-rest.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (k, d) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : d;
};
const FILE = opt('--file', 'f0slPVSjDnXgdyPmWOSVOw');
const OUT = opt('--out', here);
const ASSETS = join(OUT, '..');
const CACHE = opt('--cache', join(tmpdir(), 'solar-icons-rest-cache', FILE));
const PAGES = opt('--pages', null)?.split(',');
const FRESH = args.includes('--fresh');
const NO_SYNC = args.includes('--no-sync');
const NO_ASSETS = args.includes('--no-assets');
const manifestPath = join(here, '_pages.json');
const manifest = existsSync(manifestPath)
  ? JSON.parse(readFileSync(manifestPath, 'utf8'))
  : {
      _note:
        'Manifest of SOLAR Icons Figma pages, synced by fetch-rest.mjs. kind: "icons" pages hold Icon/* component sets, "logos" holds the logo sets, "meta" pages are text only.',
      file: FILE,
      pages: [],
    };

const file = await openFile(FILE, { cacheRoot: CACHE, fresh: FRESH });
const { version } = file;
const assetCache = join(file.cacheDir, 'assets');
mkdirSync(assetCache, { recursive: true });

// variable names: the icon fills bind Foundations variables, whose ids are already in the
// SOLAR Web name map (library ids are shared between files)
const varMapPath = join(
  here,
  '..',
  '..',
  'solar-web',
  'raw',
  '_variables.json',
);
const varMap = existsSync(varMapPath)
  ? JSON.parse(readFileSync(varMapPath, 'utf8')).variables
  : {};
const vname = (id) =>
  varMap[id] || 'unresolved:' + id.replace(/^VariableID:/, '').slice(0, 12);

// ---------- manifest sync ----------
if (!NO_SYNC) {
  const byId = new Map(manifest.pages.map((p) => [p.id, p]));
  const seen = new Set();
  let added = 0,
    updated = 0;
  for (const pg of file.pages) {
    const name = pg.name.trim();
    if (/^-+$/.test(name) || name === 'Cover') continue;
    let kind, title;
    const meta = name.match(/^\[(.+)\]$/);
    if (meta) {
      kind = 'meta';
      title = meta[1];
    } else if (/logo/i.test(name)) {
      kind = 'logos';
      title = cleanTitle(name);
    } else {
      kind = 'icons';
      // strip the leading category emoji
      title = cleanTitle(name)
        .replace(/^[^\p{L}\p{N}]+/u, '')
        .trim();
    }
    const entry = { kind, slug: slugify(title), id: pg.id, title };
    seen.add(pg.id);
    const cur = byId.get(pg.id);
    if (!cur) {
      manifest.pages.push(entry);
      added++;
      console.log('manifest: added', entry.kind + '/' + entry.slug);
    } else {
      const before = JSON.stringify([cur.title, cur.kind, cur.missingInFigma]);
      Object.assign(cur, { title, kind });
      delete cur.missingInFigma;
      if (
        before !== JSON.stringify([cur.title, cur.kind, cur.missingInFigma])
      ) {
        updated++;
        console.log('manifest: updated', cur.kind + '/' + cur.slug);
      }
    }
  }
  for (const p of manifest.pages)
    if (!seen.has(p.id) && !p.missingInFigma) {
      p.missingInFigma = true;
      console.log('manifest: missing in Figma', p.kind + '/' + p.slug);
    }
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

// ---------- helpers ----------
const hex = (c) =>
  '#' +
  [c.r, c.g, c.b]
    .map((v) =>
      Math.round(v * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('');
const kebab = (s) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
const box = (n) =>
  n.absoluteBoundingBox
    ? [
        Math.round(n.absoluteBoundingBox.width),
        Math.round(n.absoluteBoundingBox.height),
      ]
    : [0, 0];
const variantOf = (name) =>
  Object.fromEntries(
    name.split(',').map((s) =>
      s
        .trim()
        .split('=')
        .map((x) => x.trim()),
    ),
  );
// every paint of every leaf shape in an icon: solid colours with their variable, image fills
function paintsOf(node) {
  const fills = new Map(),
    strokes = new Map(),
    images = [];
  let strokeWeight = null;
  (function w(n) {
    for (const f of n.fills || []) {
      if (f.visible === false) continue;
      if (f.type === 'IMAGE') images.push(f.imageRef);
      else if (f.type === 'SOLID') {
        const id = f.boundVariables?.color?.id;
        const k = id
          ? vname(id)
          : hex(f.color) +
            (f.opacity !== undefined && f.opacity < 1 ? '@' + f.opacity : '');
        fills.set(k, (fills.get(k) || 0) + 1);
      } else fills.set(f.type, (fills.get(f.type) || 0) + 1);
    }
    for (const s of n.strokes || []) {
      if (s.visible === false) continue;
      const id = s.boundVariables?.color?.id;
      strokes.set(
        id ? vname(id) : s.type === 'SOLID' ? hex(s.color) : s.type,
        1,
      );
      if (n.strokeWeight) strokeWeight = n.strokeWeight;
    }
    (n.children || []).forEach(w);
  })(node);
  const o = {};
  if (fills.size) o.fills = [...fills.keys()];
  if (strokes.size) {
    o.strokes = [...strokes.keys()];
    if (strokeWeight) o.strokeWeight = strokeWeight;
  }
  if (images.length) o.images = images;
  return o;
}
const countLeaves = (n) => {
  let k = 0;
  (function w(x) {
    if (!x.children || !x.children.length) k++;
    else x.children.forEach(w);
  })(n);
  return k;
};

// ---------- transform ----------
function transformIconsPage(resp, p) {
  const entry = resp.nodes[p.id];
  const doc = entry.document;
  const meta = entry.componentSets || {};
  const comps = entry.components || {};
  const icons = [];
  const loose = [];
  (function w(n, parent) {
    if (n.type === 'COMPONENT_SET') {
      const m = /^Icon\/(.+)$/.exec(n.name);
      const name = m ? m[1].trim() : n.name;
      const icon = {
        name,
        figmaName: n.name,
        kebab: kebab(name),
        setId: n.id,
        description: meta[n.id]?.description || '',
        size: box(n.children[0]),
        variants: {},
        issues: [],
      };
      if (!m) icon.issues.push('Set name does not follow Icon/<Name>');
      for (const c of n.children) {
        const v = variantOf(c.name);
        const key =
          v.solid === 'true'
            ? 'solid'
            : v.solid === 'false'
              ? 'outline'
              : c.name;
        if (icon.variants[key]) icon.issues.push(`Duplicate variant ${key}`);
        icon.variants[key] = {
          id: c.id,
          size: box(c),
          leaves: countLeaves(c),
          ...paintsOf(c),
          description: comps[c.id]?.description || undefined,
        };
        if (Object.keys(v).some((k) => k !== 'solid'))
          icon.issues.push(`Unexpected variant axis in "${c.name}"`);
      }
      if (!icon.variants.outline)
        icon.issues.push('Missing outline variant (solid=false)');
      if (!icon.variants.solid)
        icon.issues.push('Missing solid variant (solid=true)');
      for (const [k, v] of Object.entries(icon.variants)) {
        if (v.size[0] !== 24 || v.size[1] !== 24)
          icon.issues.push(`${k} is ${v.size[0]}×${v.size[1]}, not 24×24`);
        if (!v.fills || v.fills.length !== 1)
          icon.issues.push(
            `${k} uses ${v.fills ? v.fills.length : 0} fill colours`,
          );
        else if (
          !/^\{?[A-Za-z]+(\(local\))?:/.test(v.fills[0]) &&
          !/^[A-Za-z]+:/.test(v.fills[0])
        )
          icon.issues.push(`${k} fill is hard-coded ${v.fills[0]}`);
        if (v.strokes)
          icon.issues.push(
            `${k} uses strokes (${v.strokes.join(', ')}); export flattens them`,
          );
        if (v.images) icon.issues.push(`${k} contains image fills`);
      }
      icons.push(icon);
      return;
    }
    if (n.type === 'COMPONENT' && (!parent || parent.type !== 'COMPONENT_SET'))
      loose.push({ name: n.name, id: n.id, size: box(n), ...paintsOf(n) });
    (n.children || []).forEach((c) => w(c, n));
  })(doc, null);
  return {
    page: p.title,
    pageId: p.id,
    kind: 'icons',
    slug: p.slug,
    icons,
    looseComponents: loose,
  };
}
function transformLogosPage(resp, p) {
  const entry = resp.nodes[p.id];
  const doc = entry.document;
  const meta = entry.componentSets || {};
  const sets = [];
  (function w(n) {
    if (n.type === 'COMPONENT_SET') {
      sets.push({
        name: n.name,
        kebab: kebab(n.name),
        setId: n.id,
        description: meta[n.id]?.description || '',
        variants: n.children.map((c) => ({
          name: c.name,
          props: variantOf(c.name),
          id: c.id,
          size: box(c),
          ...paintsOf(c),
        })),
      });
      return;
    }
    (n.children || []).forEach(w);
  })(doc);
  return { page: p.title, pageId: p.id, kind: 'logos', slug: p.slug, sets };
}
// Columns that carry personal data are dropped at capture time: this repository is public.
const DROP_COLUMNS = /^(contributors?|authors?|owners?|contacts?|e-?mail)$/i;
function transformMetaPage(resp, p) {
  const doc = resp.nodes[p.id].document;
  const texts = [];
  const tables = [];
  const inTable = new Set();
  (function w(n) {
    if (n.visible === false) return;
    if (n.type === 'FRAME' && /table/i.test(n.name)) {
      const rows = (n.children || [])
        .filter((r) => r.visible !== false && r.children)
        .map((r) => {
          const cells = [];
          (function t(x) {
            if (x.visible === false) return;
            if (x.type === 'TEXT') cells.push(x);
            (x.children || []).forEach(t);
          })(r);
          cells.forEach((c) => inTable.add(c.id));
          return cells.map((c) => c.characters.trim());
        });
      if (rows.length) {
        const drop = rows[0].map((h) => DROP_COLUMNS.test(h));
        tables.push(rows.map((r) => r.filter((_, i) => !drop[i])));
      }
      return; // rows of this table are not tables themselves
    }
    (n.children || []).forEach(w);
  })(doc);
  (function w(n) {
    if (n.visible === false) return;
    if (n.type === 'TEXT' && n.characters.trim() && !inTable.has(n.id))
      texts.push(n.characters.trim());
    (n.children || []).forEach(w);
  })(doc);
  return {
    page: p.title,
    pageId: p.id,
    kind: 'meta',
    slug: p.slug,
    texts,
    tables,
  };
}

// ---------- asset export ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function exportAssets(items, format, extra = {}) {
  // items: [{id, dest}] ; returns {id: {bytes, cached}} ; uses the version-keyed asset cache
  const todo = items.filter((it) => {
    const c = join(assetCache, it.id.replace(':', '-') + '.' + format);
    if (existsSync(c)) {
      mkdirSync(dirname(it.dest), { recursive: true });
      writeFileSync(it.dest, readFileSync(c));
      return false;
    }
    return true;
  });
  const results = {
    cached: items.length - todo.length,
    fetched: 0,
    failed: [],
  };
  for (let i = 0; i < todo.length; i += 50) {
    const batch = todo.slice(i, i + 50);
    let r;
    try {
      r = await figmaGet(`/v1/images/${FILE}`, {
        ids: batch.map((b) => b.id).join(','),
        format,
        ...extra,
      });
    } catch (e) {
      console.log(`images: batch failed: ${e.message}`);
      results.failed.push(...batch.map((b) => b.id));
      continue;
    }
    // download with limited concurrency
    let k = 0;
    const worker = async () => {
      while (k < batch.length) {
        const it = batch[k++];
        const url = r.images[it.id];
        if (!url) {
          results.failed.push(it.id);
          continue;
        }
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error('HTTP ' + res.status);
          const buf = Buffer.from(await res.arrayBuffer());
          writeFileSync(
            join(assetCache, it.id.replace(':', '-') + '.' + format),
            buf,
          );
          mkdirSync(dirname(it.dest), { recursive: true });
          writeFileSync(it.dest, buf);
          results.fetched++;
        } catch (e) {
          results.failed.push(it.id);
        }
      }
    };
    await Promise.all(Array.from({ length: 8 }, worker));
    await sleep(500);
  }
  return results;
}

// ---------- run ----------
let todo = manifest.pages;
if (PAGES) todo = todo.filter((p) => PAGES.includes(p.slug));
let n = 0,
  iconCount = 0,
  unresolved = 0;
const failed = [];
const svgJobs = [];
const logoJobs = { svg: [], png: [] };
const usedNames = new Map();
for (const p of todo) {
  if (p.exclude || p.missingInFigma) {
    console.log(
      `SKIP (${p.exclude ? 'excluded' : 'missing in Figma'})`,
      p.kind + '/' + p.slug,
    );
    continue;
  }
  let resp;
  try {
    resp = await file.nodes(p.id, p.kind + '-' + p.slug);
  } catch (e) {
    console.log(`FAILED ${p.kind}/${p.slug}: ${e.message}`);
    failed.push(p.kind + '/' + p.slug);
    continue;
  }
  if (!resp.nodes[p.id]) {
    failed.push(p.kind + '/' + p.slug);
    continue;
  }
  const doc =
    p.kind === 'icons'
      ? transformIconsPage(resp, p)
      : p.kind === 'logos'
        ? transformLogosPage(resp, p)
        : transformMetaPage(resp, p);
  const s = JSON.stringify(doc, null, 2) + '\n';
  unresolved += (s.match(/unresolved:/g) || []).length;
  const out = join(OUT, p.kind, p.slug + '.json');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, s);
  if (doc.icons) {
    iconCount += doc.icons.length;
    for (const ic of doc.icons) {
      if (usedNames.has(ic.kebab)) {
        ic.issues.push(
          `Name collision: "${ic.figmaName}" also exists on page ${usedNames.get(ic.kebab)}; exported as ${ic.kebab}--${p.slug}`,
        );
        ic.fileStem = `${ic.kebab}--${p.slug}`;
      } else ic.fileStem = ic.kebab;
      usedNames.set(ic.kebab, p.slug);
      for (const [k, v] of Object.entries(ic.variants)) {
        v.file = `svg/${k}/${ic.fileStem}.svg`;
        svgJobs.push({ id: v.id, dest: join(ASSETS, v.file) });
      }
    }
    writeFileSync(out, JSON.stringify(doc, null, 2) + '\n');
  }
  if (doc.sets)
    for (const st of doc.sets)
      for (const v of st.variants) {
        const vname2 = Object.values(v.props).map(kebab).join('-');
        if (v.images) {
          v.file = `logos/${st.kebab}/${vname2}@2x.png`;
          logoJobs.png.push({ id: v.id, dest: join(ASSETS, v.file) });
        } else {
          v.file = `logos/${st.kebab}/${vname2}.svg`;
          logoJobs.svg.push({ id: v.id, dest: join(ASSETS, v.file) });
        }
      }
  if (doc.sets) writeFileSync(out, JSON.stringify(doc, null, 2) + '\n');
  console.log(
    `OK ${p.kind}/${p.slug}${doc.icons ? ` icons=${doc.icons.length}` : doc.sets ? ` sets=${doc.sets.length}` : ` texts=${doc.texts.length}`}`,
  );
  n++;
}

let assets = { svg: null, logosSvg: null, logosPng: null };
if (!NO_ASSETS) {
  // start clean so renamed or removed icons do not linger (only when exporting everything)
  if (!PAGES)
    for (const d of ['svg', 'logos'])
      if (existsSync(join(ASSETS, d)))
        rmSync(join(ASSETS, d), { recursive: true, force: true });
  assets.svg = await exportAssets(svgJobs, 'svg', {
    svg_include_id: false,
    svg_simplify_stroke: true,
  });
  console.log(
    `svg: ${svgJobs.length} icon variants, ${assets.svg.fetched} fetched, ${assets.svg.cached} from cache, ${assets.svg.failed.length} failed`,
  );
  assets.logosSvg = await exportAssets(logoJobs.svg, 'svg', {
    svg_include_id: false,
  });
  assets.logosPng = await exportAssets(logoJobs.png, 'png', { scale: 2 });
  console.log(
    `logos: ${logoJobs.svg.length} svg + ${logoJobs.png.length} png, failed ${assets.logosSvg.failed.length + assets.logosPng.failed.length}`,
  );
  for (const r of [assets.svg, assets.logosSvg, assets.logosPng])
    if (r.failed.length) failed.push(...r.failed.map((id) => 'asset ' + id));
}
writeMeta(here, file, {
  pages: n,
  icons: iconCount,
  iconVariants: svgJobs.length,
  logoAssets: logoJobs.svg.length + logoJobs.png.length,
  failed,
  unresolvedVariableRefs: unresolved,
});
console.log(
  `done: ${n} pages, ${iconCount} icons, file version ${version}${failed.length ? `, ${failed.length} FAILED` : ''}${unresolved ? `, ${unresolved} UNRESOLVED variable refs` : ''}`,
);
if (failed.length || unresolved) process.exitCode = 2;
