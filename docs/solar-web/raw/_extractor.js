// SOLAR Web page extractor — run inside Figma via the Figma MCP `use_figma` tool
// against file key OGvmMNnywH7JWDyEhOzjcc. Replace __PAGE_ID__ and __OFF__ before
// each call. The tool caps output at ~20 KB, so the script returns
// { total, off, text } and callers page through offsets until off+len >= total.
// Output is one JSON document per Figma page (see _pages.json for the manifest).
const PAGE_ID = '__PAGE_ID__',
  OFF = __OFF__,
  LIM = 18500;
const page = await figma.getNodeByIdAsync(PAGE_ID);
await figma.setCurrentPageAsync(page);
const vcache = {},
  ccache = {},
  scache = {};
async function varName(id) {
  if (vcache[id] !== undefined) return vcache[id];
  const v = await figma.variables.getVariableByIdAsync(id);
  if (!v) {
    vcache[id] = null;
    return null;
  }
  let c = ccache[v.variableCollectionId];
  if (c === undefined) {
    const col = await figma.variables.getVariableCollectionByIdAsync(
      v.variableCollectionId,
    );
    c = col ? col.name : '?';
    ccache[v.variableCollectionId] = c;
  }
  vcache[id] = c + ':' + v.name;
  return vcache[id];
}
async function styleName(id) {
  if (!id || typeof id !== 'string') return null;
  if (scache[id] !== undefined) return scache[id];
  const s = await figma.getStyleByIdAsync(id);
  scache[id] = s ? s.name : null;
  return scache[id];
}
function hex(c) {
  const h = (x) =>
    Math.round(x * 255)
      .toString(16)
      .padStart(2, '0');
  return '#' + h(c.r) + h(c.g) + h(c.b);
}
async function paints(n, key) {
  const ps = n[key];
  if (!Array.isArray(ps)) return undefined;
  const res = [];
  for (const p of ps) {
    if (p.visible === false) continue;
    if (p.type === 'SOLID') {
      const b = p.boundVariables && p.boundVariables.color;
      res.push(
        b
          ? '{' + (await varName(b.id)) + '}'
          : hex(p.color) + (p.opacity < 1 ? ' a=' + p.opacity.toFixed(2) : ''),
      );
    } else res.push(p.type);
  }
  return res.length ? res : undefined;
}
async function bindings(n) {
  const out = {};
  const bv = n.boundVariables || {};
  for (const [k, v] of Object.entries(bv)) {
    if (k === 'fills' || k === 'strokes' || k === 'effects') continue;
    const arr = Array.isArray(v) ? v : [v];
    const names = [];
    for (const a of arr) {
      if (a && a.id) {
        const nm = await varName(a.id);
        if (nm) names.push(nm);
      }
    }
    if (names.length) out[k] = names.length === 1 ? names[0] : names;
  }
  return out;
}
async function mainName(inst) {
  const m = await inst.getMainComponentAsync();
  if (!m) return null;
  return m.parent && m.parent.type === 'COMPONENT_SET' ? m.parent.name : m.name;
}
async function layer(n, depth, maxDepth) {
  const o = { name: n.name, type: n.type };
  if (n.visible === false) o.hidden = true;
  if (n.type === 'INSTANCE') {
    const mn = await mainName(n);
    if (mn) o.main = mn;
    if (n.variantProperties && Object.keys(n.variantProperties).length)
      o.variant = n.variantProperties;
  }
  if (n.type === 'TEXT') {
    o.text = n.characters.slice(0, 80);
    const ts = await styleName(n.textStyleId);
    if (ts) o.textStyle = ts;
  }
  o.size = [Math.round(n.width), Math.round(n.height)];
  if ('layoutMode' in n && n.layoutMode !== 'NONE')
    o.layout = {
      dir: n.layoutMode,
      gap: n.itemSpacing,
      pad: [n.paddingTop, n.paddingRight, n.paddingBottom, n.paddingLeft],
      align: n.primaryAxisAlignItems + '/' + n.counterAxisAlignItems,
      sizing: n.layoutSizingHorizontal + '/' + n.layoutSizingVertical,
    };
  else if (
    n.parent &&
    'layoutMode' in n.parent &&
    n.parent.layoutMode !== 'NONE'
  )
    o.sizing = n.layoutSizingHorizontal + '/' + n.layoutSizingVertical;
  const f = await paints(n, 'fills');
  if (f) o.fills = f;
  const s = await paints(n, 'strokes');
  if (s) {
    o.strokes = s;
    o.strokeWeight = n.strokeWeight === figma.mixed ? 'mixed' : n.strokeWeight;
  }
  if ('cornerRadius' in n && n.cornerRadius !== 0)
    o.radius =
      n.cornerRadius === figma.mixed
        ? [
            n.topLeftRadius,
            n.topRightRadius,
            n.bottomRightRadius,
            n.bottomLeftRadius,
          ]
        : n.cornerRadius;
  if (n.effectStyleId) {
    const es = await styleName(n.effectStyleId);
    if (es) o.effectStyle = es;
  }
  if (n.opacity !== undefined && n.opacity < 1) o.opacity = n.opacity;
  const b = await bindings(n);
  if (Object.keys(b).length) o.vars = b;
  if (
    n.componentPropertyReferences &&
    Object.keys(n.componentPropertyReferences).length
  )
    o.propRefs = n.componentPropertyReferences;
  if ('children' in n && n.type !== 'INSTANCE' && depth < maxDepth) {
    o.children = [];
    for (const c of n.children)
      o.children.push(await layer(c, depth + 1, maxDepth));
  }
  return o;
}
async function digest(v, baseHidden) {
  const d = {
    variant: v.name,
    size: [Math.round(v.width), Math.round(v.height)],
  };
  const f = await paints(v, 'fills');
  if (f) d.fills = f;
  const s = await paints(v, 'strokes');
  if (s) d.strokes = s;
  if (v.effectStyleId) d.effect = await styleName(v.effectStyleId);
  if (v.opacity < 1) d.opacity = v.opacity;
  const tf = new Set(),
    icf = new Set(),
    hidden = new Set();
  for (const n of v.findAll()) {
    if (n.visible === false) {
      hidden.add(n.name);
      continue;
    }
    if (n.type === 'TEXT') {
      const p = await paints(n, 'fills');
      if (p) p.forEach((x) => tf.add(x));
    } else if (
      (n.type === 'VECTOR' || n.type === 'BOOLEAN_OPERATION') &&
      n.parent &&
      (n.parent.type === 'INSTANCE' ||
        (n.parent.parent && n.parent.parent.type === 'INSTANCE'))
    ) {
      const p = await paints(n, 'fills');
      if (p) p.forEach((x) => icf.add(x));
    }
  }
  if (tf.size) d.textFills = [...tf];
  if (icf.size) d.iconFills = [...icf];
  const hs = [...hidden].sort().join('|');
  if (baseHidden === undefined) d.hidden = [...hidden].sort();
  else if (hs !== baseHidden) d.hidden = [...hidden].sort();
  return d;
}
async function census(root) {
  const counts = {};
  for (const i of root.findAllWithCriteria({ types: ['INSTANCE'] })) {
    const mn = await mainName(i);
    if (mn) counts[mn] = (counts[mn] || 0) + 1;
  }
  return counts;
}
const result = {
  page: page.name,
  pageId: page.id,
  componentSets: [],
  components: [],
  frames: [],
  docText: [],
  pageContext: null,
};
for (const t of page.findAllWithCriteria({ types: ['COMPONENT_SET'] })) {
  const set = {
    name: t.name,
    id: t.id,
    description: t.description,
    docLinks: t.documentationLinks.map((l) => l.uri),
    variantCount: t.children.length,
    props: {},
    defaultVariant: t.defaultVariant ? t.defaultVariant.name : null,
  };
  for (const [k, v] of Object.entries(t.componentPropertyDefinitions))
    set.props[k] = {
      type: v.type,
      default: v.defaultValue,
      options: v.variantOptions,
    };
  const dv = t.defaultVariant || t.children[0];
  const nodeCount = dv.findAll().length;
  set.defaultVariantNodeCount = nodeCount;
  set.defaultVariantTree = await layer(dv, 0, nodeCount > 300 ? 3 : 6);
  if (nodeCount > 300) set.census = await census(dv);
  const first = await digest(dv);
  set.variants = [first];
  const baseHidden = (first.hidden || []).join('|');
  let n = 0;
  for (const c of t.children) {
    if (c === dv) continue;
    if (++n > 150) {
      set.variantsTruncated = true;
      break;
    }
    set.variants.push(await digest(c, baseHidden));
  }
  result.componentSets.push(set);
}
for (const t of page.findAllWithCriteria({ types: ['COMPONENT'] })) {
  if (t.parent && t.parent.type === 'COMPONENT_SET') continue;
  const c = { name: t.name, id: t.id, description: t.description, props: {} };
  for (const [k, v] of Object.entries(t.componentPropertyDefinitions))
    c.props[k] = {
      type: v.type,
      default: v.defaultValue,
      options: v.variantOptions,
    };
  const nodeCount = t.findAll().length;
  c.nodeCount = nodeCount;
  c.tree = await layer(t, 0, nodeCount > 300 ? 3 : 6);
  if (nodeCount > 300) c.census = await census(t);
  result.components.push(c);
}
const tops = [...page.children].sort((a, b) => a.y - b.y || a.x - b.x);
for (const t of tops) {
  if (t.type === 'COMPONENT_SET' || t.type === 'COMPONENT') continue;
  if (t.type === 'TEXT') {
    if (t.characters.startsWith('@SOLAR')) result.pageContext = t.characters;
    else result.docText.push(t.characters);
    continue;
  }
  if (!('children' in t)) continue;
  const ctx = t.findOne(
    (n) => n.type === 'TEXT' && n.characters.startsWith('@SOLAR'),
  );
  if (ctx && !result.pageContext) result.pageContext = ctx.characters;
  const isDoc = t.type === 'INSTANCE' && /Description/i.test(t.name);
  if (isDoc) {
    for (const x of t.findAllWithCriteria({ types: ['TEXT'] }))
      if (x.visible !== false && !x.characters.startsWith('@SOLAR'))
        result.docText.push(x.characters);
    continue;
  }
  const hasSet =
    t.findAllWithCriteria({ types: ['COMPONENT_SET', 'COMPONENT'] }).length > 0;
  const fr = {
    name: t.name,
    type: t.type,
    id: t.id,
    size: [Math.round(t.width), Math.round(t.height)],
  };
  if (t.type === 'INSTANCE') {
    fr.main = await mainName(t);
    if (t.variantProperties) fr.variant = t.variantProperties;
  }
  if (!hasSet) {
    fr.census = await census(t);
    fr.tree = await layer(t, 0, 2);
    const texts = t
      .findAllWithCriteria({ types: ['TEXT'] })
      .filter((x) => x.visible !== false && x.characters.length > 40)
      .map((x) => x.characters.slice(0, 300));
    if (texts.length) fr.texts = texts.slice(0, 20);
  }
  result.frames.push(fr);
}
const s = JSON.stringify(result);
return { total: s.length, off: OFF, text: s.slice(OFF, OFF + LIM) };
