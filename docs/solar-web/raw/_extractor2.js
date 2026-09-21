// SOLAR Web BATCH extractor v2 — run via use_figma on file OGvmMNnywH7JWDyEhOzjcc.
// Replace __PAGES__ with [["section/slug","id"],...] and __OFF__ with the chunk offset.
// Emits a compact payload for MANY pages in one call; _assemble2.mjs expands it to the
// same shape _extractor.js produced, one JSON file per page.
const PAGES = __PAGES__,
  OFF = __OFF__,
  LIM = 14000;
const CM = {
  Color: 'C',
  Spatial: 'S',
  Type: 'T',
  Primitives: 'P',
  Layout: 'L',
};
const vc = {},
  cc = {},
  sc = {};
async function vn(id) {
  if (vc[id] !== undefined) return vc[id];
  const v = await figma.variables.getVariableByIdAsync(id);
  if (!v) {
    vc[id] = null;
    return null;
  }
  let c = cc[v.variableCollectionId];
  if (c === undefined) {
    const col = await figma.variables.getVariableCollectionByIdAsync(
      v.variableCollectionId,
    );
    c = col ? col.name : '?';
    cc[v.variableCollectionId] = c;
  }
  vc[id] = (CM[c] || c) + ':' + v.name;
  return vc[id];
}
async function sn(id) {
  if (!id || typeof id !== 'string') return null;
  if (sc[id] !== undefined) return sc[id];
  const s = await figma.getStyleByIdAsync(id);
  sc[id] = s ? s.name : null;
  return sc[id];
}
function hx(c) {
  const h = (x) =>
    Math.round(x * 255)
      .toString(16)
      .padStart(2, '0');
  return '#' + h(c.r) + h(c.g) + h(c.b);
}
async function pnt(n, k) {
  const ps = n[k];
  if (!Array.isArray(ps)) return undefined;
  const r = [];
  for (const p of ps) {
    if (p.visible === false) continue;
    if (p.type === 'SOLID') {
      const b = p.boundVariables && p.boundVariables.color;
      r.push(
        b
          ? '{' + (await vn(b.id)) + '}'
          : hx(p.color) + (p.opacity < 1 ? ' a=' + p.opacity.toFixed(2) : ''),
      );
    } else r.push(p.type);
  }
  return r.length ? r : undefined;
}
async function bnd(n) {
  const o = {};
  const bv = n.boundVariables || {};
  for (const [k, v] of Object.entries(bv)) {
    if (k === 'fills' || k === 'strokes' || k === 'effects') continue;
    const a = Array.isArray(v) ? v : [v];
    const names = [];
    for (const x of a) {
      if (x && x.id) {
        const nm = await vn(x.id);
        if (nm) names.push(nm);
      }
    }
    if (names.length) o[k] = names.length === 1 ? names[0] : names;
  }
  return o;
}
async function mn(i) {
  const m = await i.getMainComponentAsync();
  if (!m) return null;
  return m.parent && m.parent.type === 'COMPONENT_SET' ? m.parent.name : m.name;
}
async function lay(n, d, md) {
  const o = { n: n.name, t: n.type };
  if (n.visible === false) o.h = 1;
  if (n.type === 'INSTANCE') {
    const m = await mn(n);
    if (m) o.m = m;
    if (n.variantProperties && Object.keys(n.variantProperties).length)
      o.vr = n.variantProperties;
  }
  if (n.type === 'TEXT') {
    o.tx = n.characters.slice(0, 80);
    const t = await sn(n.textStyleId);
    if (t) o.ts = t;
  }
  o.sz = [Math.round(n.width), Math.round(n.height)];
  if ('layoutMode' in n && n.layoutMode !== 'NONE')
    o.ly = [
      n.layoutMode[0],
      n.itemSpacing,
      [n.paddingTop, n.paddingRight, n.paddingBottom, n.paddingLeft],
      n.primaryAxisAlignItems + '/' + n.counterAxisAlignItems,
      n.layoutSizingHorizontal + '/' + n.layoutSizingVertical,
    ];
  else if (
    n.parent &&
    'layoutMode' in n.parent &&
    n.parent.layoutMode !== 'NONE'
  )
    o.sg = n.layoutSizingHorizontal + '/' + n.layoutSizingVertical;
  const f = await pnt(n, 'fills');
  if (f) o.f = f;
  const s = await pnt(n, 'strokes');
  if (s) {
    o.st = s;
    o.sw = n.strokeWeight === figma.mixed ? 'mixed' : n.strokeWeight;
  }
  if ('cornerRadius' in n && n.cornerRadius !== 0)
    o.r =
      n.cornerRadius === figma.mixed
        ? [
            n.topLeftRadius,
            n.topRightRadius,
            n.bottomRightRadius,
            n.bottomLeftRadius,
          ]
        : n.cornerRadius;
  if (n.effectStyleId) {
    const e = await sn(n.effectStyleId);
    if (e) o.es = e;
  }
  if (n.opacity !== undefined && n.opacity < 1) o.o = n.opacity;
  const b = await bnd(n);
  if (Object.keys(b).length) o.v = b;
  if (
    n.componentPropertyReferences &&
    Object.keys(n.componentPropertyReferences).length
  )
    o.pr = n.componentPropertyReferences;
  if ('children' in n && n.type !== 'INSTANCE' && d < md) {
    o.c = [];
    for (const ch of n.children) o.c.push(await lay(ch, d + 1, md));
  }
  return o;
}
async function dig(v) {
  const d = { vr: v.name, sz: [Math.round(v.width), Math.round(v.height)] };
  const f = await pnt(v, 'fills');
  if (f) d.f = f;
  const s = await pnt(v, 'strokes');
  if (s) d.st = s;
  if (v.effectStyleId) d.e = await sn(v.effectStyleId);
  if (v.opacity < 1) d.o = v.opacity;
  const tf = new Set(),
    ic = new Set(),
    hd = new Set();
  for (const n of v.findAll()) {
    if (n.visible === false) {
      hd.add(n.name);
      continue;
    }
    if (n.type === 'TEXT') {
      const p = await pnt(n, 'fills');
      if (p) p.forEach((x) => tf.add(x));
    } else if (
      (n.type === 'VECTOR' || n.type === 'BOOLEAN_OPERATION') &&
      n.parent &&
      (n.parent.type === 'INSTANCE' ||
        (n.parent.parent && n.parent.parent.type === 'INSTANCE'))
    ) {
      const p = await pnt(n, 'fills');
      if (p) p.forEach((x) => ic.add(x));
    }
  }
  if (tf.size) d.tf = [...tf];
  if (ic.size) d.if = [...ic];
  d.h = [...hd].sort();
  return d;
}
const eq = (a, b) =>
  JSON.stringify(a === undefined ? null : a) ===
  JSON.stringify(b === undefined ? null : b);
async function cen(r) {
  const c = {};
  for (const i of r.findAllWithCriteria({ types: ['INSTANCE'] })) {
    const m = await mn(i);
    if (m) c[m] = (c[m] || 0) + 1;
  }
  return c;
}
const out = { v: 2, pages: [] };
for (const [outPath, pid] of PAGES) {
  const page = await figma.getNodeByIdAsync(pid);
  await page.loadAsync();
  const P = {
    out: outPath,
    page: page.name,
    pageId: page.id,
    sets: [],
    comps: [],
    frames: [],
    doc: [],
    ctx: null,
  };
  for (const t of page.findAllWithCriteria({ types: ['COMPONENT_SET'] })) {
    const S = {
      n: t.name,
      i: t.id,
      d: t.description,
      dl: t.documentationLinks.map((l) => l.uri),
      vc: t.children.length,
      p: {},
      dv: t.defaultVariant ? t.defaultVariant.name : null,
    };
    for (const [k, v] of Object.entries(t.componentPropertyDefinitions))
      S.p[k] = { t: v.type, d: v.defaultValue, o: v.variantOptions };
    const dv = t.defaultVariant || t.children[0];
    const nc = dv.findAll().length;
    S.dvn = nc;
    S.tr = await lay(dv, 0, nc > 300 ? 3 : 6);
    if (nc > 300) S.cs = await cen(dv);
    const base = await dig(dv);
    S.va = [base];
    let k = 0;
    for (const c of t.children) {
      if (c === dv) continue;
      if (++k > 150) {
        S.vt = 1;
        break;
      }
      const cur = await dig(c);
      const delta = { vr: cur.vr };
      for (const key of ['sz', 'f', 'st', 'e', 'o', 'tf', 'if', 'h'])
        if (!eq(cur[key], base[key]))
          delta[key] = cur[key] === undefined ? null : cur[key];
      S.va.push(delta);
    }
    P.sets.push(S);
  }
  for (const t of page.findAllWithCriteria({ types: ['COMPONENT'] })) {
    if (t.parent && t.parent.type === 'COMPONENT_SET') continue;
    const C = { n: t.name, i: t.id, d: t.description, p: {} };
    for (const [k, v] of Object.entries(t.componentPropertyDefinitions))
      C.p[k] = { t: v.type, d: v.defaultValue, o: v.variantOptions };
    const nc = t.findAll().length;
    C.nc = nc;
    C.tr = await lay(t, 0, nc > 300 ? 3 : 6);
    if (nc > 300) C.cs = await cen(t);
    P.comps.push(C);
  }
  for (const t of [...page.children].sort((a, b) => a.y - b.y || a.x - b.x)) {
    if (t.type === 'COMPONENT_SET' || t.type === 'COMPONENT') continue;
    if (t.type === 'TEXT') {
      if (t.characters.startsWith('@SOLAR')) P.ctx = t.characters;
      else P.doc.push(t.characters);
      continue;
    }
    if (!('children' in t)) continue;
    const cx = t.findOne(
      (n) => n.type === 'TEXT' && n.characters.startsWith('@SOLAR'),
    );
    if (cx && !P.ctx) P.ctx = cx.characters;
    if (t.type === 'INSTANCE' && /Description/i.test(t.name)) {
      for (const x of t.findAllWithCriteria({ types: ['TEXT'] }))
        if (x.visible !== false && !x.characters.startsWith('@SOLAR'))
          P.doc.push(x.characters);
      continue;
    }
    const hasSet =
      t.findAllWithCriteria({ types: ['COMPONENT_SET', 'COMPONENT'] }).length >
      0;
    const F = {
      n: t.name,
      t: t.type,
      i: t.id,
      sz: [Math.round(t.width), Math.round(t.height)],
    };
    if (t.type === 'INSTANCE') {
      F.m = await mn(t);
      if (t.variantProperties) F.vr = t.variantProperties;
    }
    if (!hasSet) {
      F.cs = await cen(t);
      F.tr = await lay(t, 0, 3);
      const tx = t
        .findAllWithCriteria({ types: ['TEXT'] })
        .filter((x) => x.visible !== false && x.characters.length > 40)
        .map((x) => x.characters.slice(0, 300));
      if (tx.length) F.tx = tx.slice(0, 20);
    }
    P.frames.push(F);
  }
  out.pages.push(P);
}
const s = JSON.stringify(out);
return { total: s.length, off: OFF, text: s.slice(OFF, OFF + LIM) };
