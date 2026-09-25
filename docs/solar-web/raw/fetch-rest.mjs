// REST-based extractor for SOLAR Web. Produces the same per-page JSON shape as
// _extractor.js (MCP) but with zero model tokens: it calls the Figma REST API directly.
//
//   node docs/solar-web/raw/fetch-rest.mjs [--file KEY] [--only-missing] [--pages slug,slug]
//                                          [--cache DIR] [--out DIR] [--vars] [--fresh] [--no-sync]
//
// Refresh flow (npm run solar:sync): reads the file's current version from Figma, keys the
// response cache by that version (so a changed file is re-fetched automatically), syncs
// _pages.json with the pages that exist in Figma (adds new content pages, updates titles and
// status emoji, marks pages that disappeared), fetches every page, and writes _meta.json.
// --fresh     ignore the cache even if the version is unchanged
// --no-sync   do not touch _pages.json
//
// --vars      (re)build raw/_variables.json from GET /v1/files/KEY/variables/local
//             (needs a token with the file_variables:read scope)
// --expect-version V
//             stop before writing anything unless Figma's current version is V: rebuilds the
//             mirror from the cache of the version it already holds (after a change to this
//             script), never a newer one
// --cache     directory for raw REST responses (default: $TMPDIR/solar-web-rest-cache)
// --out       output root (default: docs/solar-web/raw). Use a temp dir to compare.
// Token: $FIGMA_TOKEN or ~/.config/figma/token.
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
  figmaGet,
  openFile,
  slugify,
  statusOf,
  cleanTitle,
  writeMeta,
} from '../../_shared/figma-rest.mjs';
import { drawnPath } from './drawn-path.mjs';
import { hiddenPathsOf, overrides } from './variant-diff.mjs';
const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (k, d) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : d;
};
const FILE = opt('--file', 'OGvmMNnywH7JWDyEhOzjcc');
const OUT = opt('--out', here);
const CACHE = opt('--cache', join(tmpdir(), 'solar-web-rest-cache', FILE));
const ONLY_MISSING = args.includes('--only-missing');
const PAGES = opt('--pages', null)?.split(',');
const FRESH = args.includes('--fresh');
const NO_SYNC = args.includes('--no-sync');
const manifestPath = join(here, '_pages.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

// ---------- file version + manifest sync ----------
const file = await openFile(FILE, { cacheRoot: CACHE, fresh: FRESH });
const { head, version } = file;
const EXPECT = opt('--expect-version', null);
if (EXPECT && version !== EXPECT) {
  console.error(
    `Figma's version is ${version}, not ${EXPECT}: nothing written (run solar:sync to take it)`,
  );
  process.exit(1);
}
const TOP = {
  '◼︎ TOKENS': 'tokens',
  '❖ COMPONENTS': 'components',
  '⊞ PATTERNS': 'patterns',
  '▤ VIEWS': 'views',
};
const SUB = {
  'buttons & actions': 'buttons',
  'inputs & forms': 'inputs',
  'feedback & alerts': 'feedback',
  'dialogs & sheets': 'dialogs',
  'cards & containers': 'cards',
  'layout & shell': 'layout-shell',
  'generic views': 'generic',
  'auth & onboarding': 'auth',
  'account & identity': 'account',
  'organization & admin': 'org-admin',
  'devices & operations': 'devices',
  'help & discovery': 'help',
  'system states': 'system',
};
if (!NO_SYNC) {
  const byId = new Map(manifest.pages.map((p) => [p.id, p]));
  const seen = new Set();
  let top = null,
    sub = null,
    added = 0,
    renamed = 0;
  for (const pg of head.document.children) {
    const name = pg.name.trim();
    if (/^-+$/.test(name) || name === 'Cover' || /^\.\[/.test(name)) {
      continue;
    }
    if (TOP[name]) {
      top = TOP[name];
      sub = null;
      continue;
    }
    if (!/^↳/.test(name)) {
      if (/^\[/.test(name)) continue;
      const k = name.toLowerCase();
      sub = SUB[k] || slugify(k);
      continue;
    }
    if (!top) continue;
    seen.add(pg.id);
    const title = cleanTitle(name);
    const status = statusOf(name);
    const existing = byId.get(pg.id);
    if (existing) {
      if (existing.title !== title) {
        existing.title = title;
        renamed++;
      }
      existing.status = status;
      delete existing.missingInFigma;
      continue;
    }
    const section = top === 'tokens' ? 'tokens' : sub ? `${top}/${sub}` : top;
    manifest.pages.push({
      section,
      slug: slugify(title),
      id: pg.id,
      title,
      status,
    });
    added++;
  }
  let missing = 0;
  for (const p of manifest.pages) {
    if (p.section === 'meta') continue;
    if (!seen.has(p.id)) {
      p.missingInFigma = true;
      missing++;
    }
  }
  manifest.lastSync = {
    file: FILE,
    version,
    lastModified: head.lastModified,
    date: new Date().toISOString().slice(0, 10),
  };
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(
    `manifest: ${manifest.pages.length} pages (+${added} new, ${renamed} retitled, ${missing} missing in Figma) · file version ${version} · lastModified ${head.lastModified}`,
  );
}

// ---------- variable name map ----------
const varMapPath = join(here, '_variables.json');
if (args.includes('--vars')) {
  const v = await figmaGet(`/v1/files/${FILE}/variables/local`);
  const cols = v.meta.variableCollections;
  const map = {};
  for (const [id, x] of Object.entries(v.meta.variables))
    map[id] = (cols[x.variableCollectionId]?.name || '?') + ':' + x.name;
  writeFileSync(
    varMapPath,
    JSON.stringify(
      {
        _note:
          'VariableID -> Collection:name, from GET /variables/local on ' +
          FILE +
          '. Generated by fetch-rest.mjs --vars.',
        file: FILE,
        count: Object.keys(map).length,
        variables: map,
      },
      null,
      1,
    ) + '\n',
  );
  console.log('variables map:', Object.keys(map).length);
}
const varMap = existsSync(varMapPath)
  ? JSON.parse(readFileSync(varMapPath, 'utf8')).variables
  : {};
const vname = (id) =>
  varMap[id] || 'unresolved:' + id.replace(/^VariableID:/, '').slice(0, 12);

// ---------- transform ----------
const hex = (c) =>
  '#' +
  [c.r, c.g, c.b]
    .map((x) =>
      Math.round(x * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('');
function paints(arr) {
  if (!Array.isArray(arr)) return undefined;
  const r = [];
  for (const p of arr) {
    if (p.visible === false) continue;
    if (p.type === 'SOLID') {
      const b = p.boundVariables && p.boundVariables.color;
      const op = p.opacity ?? 1;
      // For a bound colour REST reports the variable's own alpha as the paint's opacity, so it is
      // not written: the token already carries it, and writing it again would draw a 20% border at
      // 4%. Measured 2026-09-23: in all 1742 bound paints with an opacity it equalled the token's
      // alpha. Only an unbound colour's opacity is its own.
      r.push(
        b
          ? '{' + vname(b.id) + '}'
          : hex(p.color) + (op < 1 ? ' a=' + op.toFixed(2) : ''),
      );
    } else if (p.type === 'GRADIENT_LINEAR') r.push(linearGradient(p));
    else r.push(p.type);
  }
  return r.length ? r : undefined;
}
/**
 * A linear gradient as one string: where it runs, its start and end handles as fractions of the
 * layer's box (x,y, Figma's gradientHandlePositions), then each stop's colour, bound as a solid
 * paint's is or as a hex with its alpha, at its position:
 * `linear-gradient(0,0.68 → 1,0.68: {Primitives:color/alpha/transparent} 0%, {Color:surface/base} 100%)`.
 */
function linearGradient(p) {
  const at = (h) => `${+h.x.toFixed(2)},${+h.y.toFixed(2)}`;
  const [from, to] = p.gradientHandlePositions ?? [];
  const stops = (p.gradientStops ?? []).map((s) => {
    const b = s.boundVariables && s.boundVariables.color;
    const alpha = s.color.a ?? 1;
    const colour = b
      ? '{' + vname(b.id) + '}'
      : hex(s.color) + (alpha < 1 ? ' a=' + alpha.toFixed(2) : '');
    return `${colour} ${+(s.position * 100).toFixed(2)}%`;
  });
  return `linear-gradient(${at(from)} → ${at(to)}: ${stops.join(', ')})`;
}
const KEYMAP = {
  BORDER_TOP_WEIGHT: 'strokeTopWeight',
  BORDER_RIGHT_WEIGHT: 'strokeRightWeight',
  BORDER_BOTTOM_WEIGHT: 'strokeBottomWeight',
  BORDER_LEFT_WEIGHT: 'strokeLeftWeight',
  RECTANGLE_TOP_LEFT_CORNER_RADIUS: 'topLeftRadius',
  RECTANGLE_TOP_RIGHT_CORNER_RADIUS: 'topRightRadius',
  RECTANGLE_BOTTOM_LEFT_CORNER_RADIUS: 'bottomLeftRadius',
  RECTANGLE_BOTTOM_RIGHT_CORNER_RADIUS: 'bottomRightRadius',
  x: 'width',
  y: 'height',
};
function bindings(n) {
  const out = {};
  const bv = n.boundVariables || {};
  const put = (k, v) => {
    if (!v) return;
    if (Array.isArray(v)) {
      const a = v.filter((x) => x && x.id).map((x) => vname(x.id));
      if (a.length) out[k] = a.length === 1 ? a[0] : a;
    } else if (v.id) out[k] = vname(v.id);
  };
  for (const [k, v] of Object.entries(bv)) {
    if (k === 'fills' || k === 'strokes' || k === 'effects') continue;
    if (v && typeof v === 'object' && !v.type && !Array.isArray(v)) {
      for (const [k2, v2] of Object.entries(v)) put(KEYMAP[k2] || k2, v2);
    } else put(KEYMAP[k] || k, v);
  }
  return out;
}
function makeCtx(resp) {
  const comps = resp.components || {},
    sets = resp.componentSets || {},
    styles = resp.styles || {};
  return {
    mainName: (n) => {
      const c = comps[n.componentId];
      if (!c) return null;
      return c.componentSetId && sets[c.componentSetId]
        ? sets[c.componentSetId].name
        : c.name;
    },
    styleName: (id) => styles[id]?.name || null,
    sets,
    comps,
  };
}
const box = (n) =>
  n.absoluteBoundingBox
    ? [
        Math.round(n.absoluteBoundingBox.width),
        Math.round(n.absoluteBoundingBox.height),
      ]
    : [0, 0];
const variantOf = (n) => {
  const o = {};
  for (const [k, v] of Object.entries(n.componentProperties || {}))
    if (v.type === 'VARIANT') o[k] = v.value;
  return Object.keys(o).length ? o : null;
};
// The node types that draw an icon's shape.
const VECTOR_TYPES = new Set([
  'VECTOR',
  'BOOLEAN_OPERATION',
  'ELLIPSE',
  'RECTANGLE',
  'LINE',
  'STAR',
  'REGULAR_POLYGON',
]);
// The node types whose shape only a path describes.
const GEOMETRY_TYPES = new Set([
  'VECTOR',
  'BOOLEAN_OPERATION',
  'LINE',
  'STAR',
  'REGULAR_POLYGON',
]);
const geometry = (list, n) =>
  list?.length
    ? list.map((g) => ({
        path: drawnPath(g.path, n),
        windingRule: g.windingRule,
      }))
    : null;
function layer(n, parent, depth, maxDepth, ctx) {
  const o = { name: n.name, type: n.type };
  if (n.visible === false) o.hidden = true;
  if (n.type === 'INSTANCE') {
    const m = ctx.mainName(n);
    if (m) o.main = m;
    const v = variantOf(n);
    if (v) o.variant = v;
    // An icon's colour is on the vectors inside the instance, which the tree does not descend
    // into. Recording it here ties each colour to the icon that draws it; the variant digest's
    // iconFills lists every icon's colour without saying whose.
    if (m && m.startsWith('Icon/')) {
      const fills = new Set();
      for (const [d] of walk(n))
        if (d !== n && d.visible !== false && VECTOR_TYPES.has(d.type))
          for (const f of paints(d.fills) || []) fills.add(f);
      if (fills.size) o.iconFills = [...fills];
    }
  }
  if (n.type === 'TEXT') {
    o.text = (n.characters || '').slice(0, 80);
    const ts = ctx.styleName(n.styles?.text);
    if (ts) o.textStyle = ts;
  }
  o.size = box(n);
  // Where a layer sits in its parent, where the parent's auto layout does not place it: a child of
  // a frame with no auto layout (StatusIndicator's `!` inside its triangle, a Toggle's knob) or one
  // positioned absolutely inside one. Its top-left, from the bounding boxes, relative to the
  // parent's, to the hundredth. A tree's own root (depth 0) is placed on its page or in its set,
  // which says nothing about the component.
  const placed =
    depth > 0 &&
    parent &&
    (!parent.layoutMode ||
      parent.layoutMode === 'NONE' ||
      n.layoutPositioning === 'ABSOLUTE');
  if (placed && n.absoluteBoundingBox && parent.absoluteBoundingBox) {
    const at = (a, b) => Math.round((a - b) * 100) / 100;
    o.position = [
      at(n.absoluteBoundingBox.x, parent.absoluteBoundingBox.x),
      at(n.absoluteBoundingBox.y, parent.absoluteBoundingBox.y),
    ];
    // What it is pinned to, `horizontal/vertical` (Table's mobile fade: `RIGHT/TOP`), where that is
    // not Figma's default, the left and the top.
    const c = n.constraints;
    if (c && (c.horizontal !== 'LEFT' || c.vertical !== 'TOP'))
      o.constraints = `${c.horizontal}/${c.vertical}`;
  }
  const hasLayout = n.layoutMode && n.layoutMode !== 'NONE';
  if (hasLayout)
    o.layout = {
      dir: n.layoutMode,
      gap: n.itemSpacing || 0,
      pad: [
        n.paddingTop || 0,
        n.paddingRight || 0,
        n.paddingBottom || 0,
        n.paddingLeft || 0,
      ],
      align:
        (n.primaryAxisAlignItems || 'MIN') +
        '/' +
        (n.counterAxisAlignItems || 'MIN'),
      sizing:
        (n.layoutSizingHorizontal || 'FIXED') +
        '/' +
        (n.layoutSizingVertical || 'FIXED'),
    };
  else if (parent && parent.layoutMode && parent.layoutMode !== 'NONE')
    o.sizing =
      (n.layoutSizingHorizontal || 'FIXED') +
      '/' +
      (n.layoutSizingVertical || 'FIXED');
  const f = paints(n.fills);
  if (f) o.fills = f;
  const s = paints(n.strokes);
  if (s) {
    o.strokes = s;
    const iw = n.individualStrokeWeights;
    const mixed = iw && new Set(Object.values(iw)).size > 1;
    o.strokeWeight = mixed
      ? 'mixed'
      : (n.strokeWeight ?? (iw ? Object.values(iw)[0] : 0));
    // Where the sides differ, each one's weight, top, right, bottom, left: Button Group's divider
    // is a top stroke only, which 'mixed' alone does not say.
    if (mixed) o.strokeWeights = [iw.top, iw.right, iw.bottom, iw.left];
    // A dashed stroke's pattern, each dash's length and the gap after it (FileUpload's drop zone,
    // Time Slot's half-hour rule), which the paths alone do not say along another length.
    if (n.strokeDashes?.length) o.dashes = [...n.strokeDashes];
  }
  // A part of an ellipse (Donut Chart's segments): its angles, in radians, and its hole, as a
  // fraction of its radius; a whole one records none.
  const arc = n.arcData;
  if (
    arc &&
    !(
      arc.startingAngle === 0 &&
      arc.innerRadius === 0 &&
      arc.endingAngle > 6.28
    )
  ) {
    const r = (v) => Math.round(v * 1e4) / 1e4;
    o.arc = {
      start: r(arc.startingAngle),
      end: r(arc.endingAngle),
      inner: r(arc.innerRadius),
    };
  }
  if (n.cornerRadius) o.radius = n.cornerRadius;
  else if (n.rectangleCornerRadii && n.rectangleCornerRadii.some((x) => x))
    o.radius = n.rectangleCornerRadii;
  const es = ctx.styleName(n.styles?.effect);
  if (es) o.effectStyle = es;
  if (n.opacity !== undefined && n.opacity < 1) o.opacity = n.opacity;
  // A drawn shape's outline, in the layer's own coordinates, for the node types whose shape is not
  // already described by their size and radius (a rectangle or an ellipse is).
  if (GEOMETRY_TYPES.has(n.type)) {
    const g = geometry(n.fillGeometry, n);
    if (g) o.geometry = g;
    const sg = s ? geometry(n.strokeGeometry, n) : null;
    if (sg) o.strokeGeometry = sg;
  }
  const b = bindings(n);
  if (Object.keys(b).length) o.vars = b;
  if (
    n.componentPropertyReferences &&
    Object.keys(n.componentPropertyReferences).length
  )
    o.propRefs = n.componentPropertyReferences;
  if (n.children && n.type !== 'INSTANCE' && depth < maxDepth)
    o.children = n.children.map((c) => layer(c, n, depth + 1, maxDepth, ctx));
  return o;
}
function* walk(n, parent = null) {
  yield [n, parent];
  for (const c of n.children || []) yield* walk(c, n);
}
const countNodes = (n) => {
  let k = -1;
  for (const _ of walk(n)) k++;
  return k;
};
function census(root, ctx) {
  const c = {};
  for (const [n] of walk(root))
    if (n.type === 'INSTANCE') {
      const m = ctx.mainName(n);
      if (m) c[m] = (c[m] || 0) + 1;
    }
  return c;
}
function digest(v, ctx, baseHidden, basePaths) {
  // The variant's own node, for a map from Figma's IDs to the code's names (Code Connect, a
  // manifest): the set's node alone names the component, not the variant.
  const d = { variant: v.name, id: v.id, size: box(v) };
  const f = paints(v.fills);
  if (f) d.fills = f;
  const s = paints(v.strokes);
  if (s) d.strokes = s;
  const es = ctx.styleName(v.styles?.effect);
  if (es) d.effect = es;
  if (v.opacity !== undefined && v.opacity < 1) d.opacity = v.opacity;
  const tf = new Set(),
    ic = new Set(),
    hd = new Set();
  for (const [n, p] of walk(v)) {
    if (n === v) continue;
    if (n.visible === false) {
      hd.add(n.name);
      continue;
    }
    if (n.type === 'TEXT') {
      const x = paints(n.fills);
      if (x) x.forEach((y) => tf.add(y));
    } else if (
      (n.type === 'VECTOR' || n.type === 'BOOLEAN_OPERATION') &&
      p &&
      (p.type === 'INSTANCE' || (p.__parent && p.__parent.type === 'INSTANCE'))
    ) {
      const x = paints(n.fills);
      if (x) x.forEach((y) => ic.add(y));
    }
  }
  if (tf.size) d.textFills = [...tf];
  if (ic.size) d.iconFills = [...ic];
  const hs = [...hd].sort().join('|');
  if (baseHidden === undefined) d.hidden = [...hd].sort();
  else if (hs !== baseHidden) d.hidden = [...hd].sort();
  // The same layers by path, which tells a composed child's hidden layer from the component's own
  // of the same name; recorded as the names are, where they differ from the default's.
  const paths = hiddenPathsOf(v);
  if (basePaths === undefined || paths.join('|') !== basePaths)
    d.hiddenPaths = paths;
  return d;
}
function linkParents(n, p = null) {
  n.__parent = p;
  for (const c of n.children || []) linkParents(c, n);
}
// ---- per-variant overrides: what a variant changes relative to the default variant ----
// In variant-diff.mjs, which the codegen's tests load without calling the API.
const props = (defs) =>
  Object.fromEntries(
    Object.entries(defs || {}).map(([k, v]) => [
      k,
      { type: v.type, default: v.defaultValue, options: v.variantOptions },
    ]),
  );
function transformPage(resp, pageId) {
  const entry = resp.nodes[pageId];
  const page = entry.document;
  const ctx = makeCtx(entry);
  linkParents(page);
  const result = {
    page: page.name,
    pageId: page.id,
    componentSets: [],
    components: [],
    frames: [],
    docText: [],
    pageContext: null,
  };
  for (const [n] of walk(page)) {
    if (n.type === 'COMPONENT_SET') {
      const meta = ctx.sets[n.id] || {};
      const set = {
        name: n.name,
        id: n.id,
        description: meta.description || '',
        docLinks: (meta.documentationLinks || []).map((l) => l.uri),
        variantCount: n.children.length,
        props: props(n.componentPropertyDefinitions),
        defaultVariant: null,
      };
      const defaults = Object.entries(n.componentPropertyDefinitions || {})
        .filter(([, v]) => v.type === 'VARIANT')
        .map(([k, v]) => k + '=' + v.defaultValue);
      const parse = (name) => name.split(',').map((s) => s.trim());
      let dv =
        n.children.find((c) => {
          const parts = parse(c.name);
          return defaults.every((d) => parts.includes(d));
        }) || n.children[0];
      set.defaultVariant = dv.name;
      const nc = countNodes(dv);
      set.defaultVariantNodeCount = nc;
      set.defaultVariantTree = layer(dv, n, 0, nc > 300 ? 3 : 6, ctx);
      if (nc > 300) set.census = census(dv, ctx);
      const base = digest(dv, ctx);
      set.variants = [base];
      const bh = (base.hidden || []).join('|');
      const bp = (base.hiddenPaths || []).join('|');
      const depth = nc > 300 ? 3 : 6;
      let k = 0;
      for (const c of n.children) {
        if (c === dv) continue;
        if (++k > 150) {
          set.variantsTruncated = true;
          break;
        }
        const d = digest(c, ctx, bh, bp);
        const ov = overrides(
          set.defaultVariantTree,
          layer(c, n, 0, depth, ctx),
        );
        if (ov) d.overrides = ov;
        set.variants.push(d);
      }
      result.componentSets.push(set);
    } else if (
      n.type === 'COMPONENT' &&
      !(n.__parent && n.__parent.type === 'COMPONENT_SET')
    ) {
      const meta = ctx.comps[n.id] || {};
      const nc = countNodes(n);
      const c = {
        name: n.name,
        id: n.id,
        description: meta.description || '',
        props: props(n.componentPropertyDefinitions),
        nodeCount: nc,
        tree: layer(n, n.__parent, 0, nc > 300 ? 3 : 6, ctx),
      };
      // Every layer it hides by path, into the instances the tree does not descend into, as a
      // set's variants record them: what a composed child hides is then its own (Calendar
      // Toolbar's Segmented Control, its label hidden).
      const hiddenPaths = hiddenPathsOf(n);
      if (hiddenPaths.length) c.hiddenPaths = hiddenPaths;
      if (nc > 300) c.census = census(n, ctx);
      result.components.push(c);
    }
  }
  const tops = [...page.children].sort(
    (a, b) =>
      (a.absoluteBoundingBox?.y ?? 0) - (b.absoluteBoundingBox?.y ?? 0) ||
      (a.absoluteBoundingBox?.x ?? 0) - (b.absoluteBoundingBox?.x ?? 0),
  );
  for (const t of tops) {
    if (t.type === 'COMPONENT_SET' || t.type === 'COMPONENT') continue;
    if (t.type === 'TEXT') {
      if ((t.characters || '').startsWith('@SOLAR'))
        result.pageContext = t.characters;
      else result.docText.push(t.characters);
      continue;
    }
    if (!t.children) continue;
    const texts = [...walk(t)].map(([n]) => n).filter((n) => n.type === 'TEXT');
    const cx = texts.find((n) => (n.characters || '').startsWith('@SOLAR'));
    if (cx && !result.pageContext) result.pageContext = cx.characters;
    if (t.type === 'INSTANCE' && /Description/i.test(t.name)) {
      for (const x of texts)
        if (x.visible !== false && !(x.characters || '').startsWith('@SOLAR'))
          result.docText.push(x.characters);
      continue;
    }
    const hasSet = [...walk(t)].some(
      ([n]) => n.type === 'COMPONENT_SET' || n.type === 'COMPONENT',
    );
    const fr = { name: t.name, type: t.type, id: t.id, size: box(t) };
    if (t.type === 'INSTANCE') {
      fr.main = ctx.mainName(t);
      const v = variantOf(t);
      if (v) fr.variant = v;
    }
    if (!hasSet) {
      fr.census = census(t, ctx);
      fr.tree = layer(t, page, 0, 2, ctx);
      const tx = texts
        .filter((x) => x.visible !== false && (x.characters || '').length > 40)
        .map((x) => x.characters.slice(0, 300));
      if (tx.length) fr.texts = tx.slice(0, 20);
    }
    result.frames.push(fr);
  }
  return result;
}

// ---------- run ----------
let todo = manifest.pages;
if (PAGES) todo = todo.filter((p) => PAGES.includes(p.slug));
if (ONLY_MISSING)
  todo = todo.filter(
    (p) => !existsSync(join(here, p.section, p.slug + '.json')),
  );
let n = 0,
  unresolved = 0;
const failed = [];
for (const p of todo) {
  // Excluded pages are never fetched and any previously fetched copy is removed, so the flag is
  // the single switch: delete it from _pages.json and the next sync brings the page back.
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
    // geometry=paths adds each vector's outline (fillGeometry, strokeGeometry), the only record of
    // a drawn glyph's shape: Checkbox's tick, StatusIndicator's marks, Sparkline's sample line.
    resp = await file.nodes(p.id, p.slug, { geometry: 'paths' });
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
  const doc = transformPage(resp, p.id);
  const s = JSON.stringify(doc, null, 2) + '\n';
  const u = (s.match(/unresolved:/g) || []).length;
  unresolved += u;
  const out = join(OUT, p.section, p.slug + '.json');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, s);
  console.log(
    `OK ${p.section}/${p.slug} sets=${doc.componentSets.length} components=${doc.components.length} frames=${doc.frames.length} docText=${doc.docText.length}${u ? ' unresolvedVars=' + u : ''}`,
  );
  n++;
}
writeMeta(here, file, { pages: n, failed, unresolvedVariableRefs: unresolved });
console.log(
  `done: ${n} pages, file version ${version}${failed.length ? `, ${failed.length} FAILED (re-run to retry: ${failed.join(', ')})` : ''}${unresolved ? `, ${unresolved} UNRESOLVED variable refs: resolve the new VariableIDs (see raw/README.md) and add them to _variables.json` : ''}`,
);
// A page that could not be fetched is a failure: the data on disk is now incomplete.
// An unresolved variable reference is not -- every page was written, and the id is recorded in
// _meta.json and named in the output above so it can be added to _variables.json. Exiting
// non-zero for a finding is what stopped `solar:sync` from rebuilding the docs and from
// reaching the icons file at all.
if (failed.length) process.exitCode = 2;
