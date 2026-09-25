// The pure part of the SOLAR Web fetcher (fetch-rest.mjs): what one variant changes relative to
// the default variant, and which of its layers it hides. Kept apart from the fetcher, which calls
// the Figma API as it loads, so that the codegen's tests can check it on node trees of their own
// (packages/codegen/test/variant-diff.test.mjs).

// Both trees come from the fetcher's layer(); layers are addressed by a path of names, with #k
// appended when siblings share a name. Only the fields below are compared.
export const DIFF_KEYS = [
  'hidden',
  'text',
  'textStyle',
  'main',
  'variant',
  'size',
  'position',
  'constraints',
  'layout',
  'sizing',
  'fills',
  'strokes',
  'strokeWeight',
  'strokeWeights',
  'radius',
  'effectStyle',
  'opacity',
  'vars',
  'iconFills',
  'geometry',
  'strokeGeometry',
];

// Paths name layers (`/Icon/None#2`), and layer names contain `/` themselves, so a path cannot be
// split to find its parent. `parents` records it as the tree is walked.
export function flatten(
  tree,
  prefix = '',
  out = {},
  parents = {},
  parent = null,
) {
  const path = prefix || '/';
  out[path] = tree;
  parents[path] = parent;
  const seen = {};
  for (const c of tree.children || []) {
    const k = (seen[c.name] = (seen[c.name] || 0) + 1);
    flatten(
      c,
      prefix + '/' + c.name + (k > 1 ? '#' + k : ''),
      out,
      parents,
      path,
    );
  }
  return out;
}

/**
 * The path of every layer a variant hides, in the tree's addressing, down into the instances the
 * tree does not descend into: a composed child's hidden layers are then its own, where a name
 * alone may be another layer's (Device Card's Dropdown label and Tag words, both `Label`).
 *
 * @param {object} node a variant, as the Figma API returns it
 * @returns {string[]} sorted
 */
export function hiddenPathsOf(node) {
  const out = [];
  const visit = (n, path) => {
    const seen = {};
    for (const c of n.children || []) {
      const k = (seen[c.name] = (seen[c.name] || 0) + 1);
      const at = `${path === '/' ? '' : path}/${c.name}${k > 1 ? '#' + k : ''}`;
      if (c.visible === false) out.push(at);
      visit(c, at);
    }
  };
  visit(node, '/');
  return out.sort();
}

/**
 * What a variant's tree changes relative to the default's: the layers it changes, those it adds
 * (with where it adds each, `index` among its siblings in this variant) and those it removes; or
 * null where it changes nothing.
 */
export function overrides(baseTree, varTree) {
  const a = flatten(baseTree),
    parents = {},
    b = flatten(varTree, '', {}, parents);
  const changed = {},
    added = [],
    removed = [];
  for (const [path, bn] of Object.entries(b)) {
    const an = a[path];
    if (!an) {
      // The layer itself, not only its path: a layer that exists in this variant alone has no
      // properties anywhere else. Its children are added paths of their own. Where it sits among
      // its siblings, since a consumer reading the default's layers first would otherwise put it
      // after them all (Card's loading title placeholder, drawn above the content).
      const { children: _children, ...own } = bn;
      const index = b[parents[path]].children.indexOf(bn);
      added.push({ path, parent: parents[path], index, layer: own });
      continue;
    }
    const diff = {};
    for (const k of DIFF_KEYS) {
      if (k === 'size' && path === '/') continue; // root size is in the digest
      const x = JSON.stringify(an[k] ?? null),
        y = JSON.stringify(bn[k] ?? null);
      if (x === y) continue;
      // vars and layout are objects: report only the sub-keys that differ (null = removed)
      if ((k === 'vars' || k === 'layout') && an[k] && bn[k]) {
        const sub = {};
        for (const kk of new Set([
          ...Object.keys(an[k]),
          ...Object.keys(bn[k]),
        ]))
          if (
            JSON.stringify(an[k][kk] ?? null) !==
            JSON.stringify(bn[k][kk] ?? null)
          )
            sub[kk] = bn[k][kk] ?? null;
        diff[k] = sub;
      } else diff[k] = bn[k] ?? null;
    }
    if (Object.keys(diff).length) changed[path] = diff;
  }
  for (const path of Object.keys(a)) if (!b[path]) removed.push(path);
  const o = {};
  if (Object.keys(changed).length) o.changed = changed;
  if (added.length) o.added = added;
  if (removed.length) o.removed = removed;
  return Object.keys(o).length ? o : null;
}
