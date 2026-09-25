/**
 * Where a layer its parent's auto layout does not place sits, and from which of the parent's
 * edges. Where Figma pins it to one edge (its constraint, which the fetcher records where it is not
 * the left and the top: Table's mobile fade, `RIGHT/TOP`), that edge. Otherwise, along an axis the
 * parent grows on (it fills or hugs, so its size is not the one drawn), a layer keeps its distance
 * from the parent's nearer edge -- Text Area's send button, 8px in from the field's right, stays in
 * that corner however wide the field is. Along a fixed axis the two are one, and the place is kept
 * from the left and the top.
 *
 * Read from Figma alone, so the recipe (recipe.mjs) and the oracle (verify/oracle.mjs) both place a
 * layer by it, and neither reads the other.
 */

/** A layer's sizing per axis, `FILL`, `HUG` or `FIXED`, from its auto layout or its parent's. */
const sizingOf = (layer) =>
  (layer?.layout?.sizing ?? layer?.sizing)?.split('/') ?? [];

/** A distance, clear of Figma's float noise, as positions are drawn. */
const clean = (n) => Math.round(n * 1e4) / 1e4;

/**
 * Along axis `i`, what Figma pins the layer to, where the fetcher recorded a constraint other than
 * its default (`RIGHT/TOP`, Table's mobile fade): true for the far edge (RIGHT, BOTTOM), false for
 * the near one (LEFT, TOP), and null where it pins neither alone (CENTER, SCALE, both edges), which
 * the layer's place decides as before.
 */
function pinnedFar(layer, i) {
  const c = layer.constraints?.split('/')[i];
  if (c === 'RIGHT' || c === 'BOTTOM') return true;
  if (c === 'LEFT' || c === 'TOP') return false;
  return null;
}

/** Along axis `i`: whether the layer is nearer its parent's far edge, in a parent that grows. */
function nearerFar(layer, parent, i) {
  const pinned = pinnedFar(layer, i);
  if (pinned !== null) return pinned;
  const grows = sizingOf(parent)[i];
  const room = parent?.size?.[i];
  if (!grows || grows === 'FIXED' || room === undefined) return false;
  const at = layer.position[i];
  return room - at - (layer.size?.[i] ?? 0) < at;
}

/**
 * Per axis, whether a layer is pinned to its parent's far edge (the right, the bottom): where every
 * variant that places it places it nearer that edge, in a parent that grows along the axis. A layer
 * one variant places nearer the left and another nearer the right keeps Figma's left.
 *
 * @param {Array<{layers: Map<string, object>, parents: Map<string, string>}>} variants
 * @returns {[boolean, boolean]}
 */
export function farEdgesOf(variants, path) {
  const placed = variants.filter((v) => v.layers.get(path)?.position);
  return [0, 1].map(
    (i) =>
      placed.length > 0 &&
      placed.every((v) =>
        nearerFar(v.layers.get(path), v.layers.get(v.parents.get(path)), i),
      ),
  );
}

/**
 * The place of a layer placed by position: `x` or `right`, `y` or `bottom`, by the edges it is
 * pinned to (farEdgesOf), or `centerX`, `centerY` where Figma pins it to its parent's centre (a
 * Tooltip's arrow, `CENTER/BOTTOM`): how far its centre sits from the parent's, so it stays in the
 * middle of a parent of any size. Nothing where its parent's auto layout places it.
 *
 * @returns {{x?: number, y?: number, right?: number, bottom?: number, centerX?: number,
 *   centerY?: number}}
 */
export function placementOf(layer, parent, far = [false, false]) {
  if (!layer.position) return {};
  const out = {};
  [
    ['x', 'right', 'centerX'],
    ['y', 'bottom', 'centerY'],
  ].forEach(([near, farCell, centre], i) => {
    const at = layer.position[i];
    // Figma's constraint, where it records one, is this variant's: a Tooltip's arrow is pinned to
    // the centre, the left or the right by where the tooltip points.
    const pinned = pinnedFar(layer, i);
    // Pinned to the centre along an axis the parent grows on (a Tooltip's, which hugs its words);
    // along a fixed one the centre and the place are one, and the place is kept as before.
    const grows = sizingOf(parent)[i];
    if (
      layer.constraints?.split('/')[i] === 'CENTER' &&
      parent?.size &&
      grows &&
      grows !== 'FIXED'
    )
      out[centre] = clean(at + (layer.size?.[i] ?? 0) / 2 - parent.size[i] / 2);
    else if (pinned ?? far[i])
      out[farCell] = clean(parent.size[i] - at - (layer.size?.[i] ?? 0));
    else out[near] = at;
  });
  return out;
}

/**
 * Where variants lay a parent's children out in different orders (a Popover's tip, before its
 * content where it points up or left, after it elsewhere), each laid-out child's rank among them,
 * per variant: `path -> variant name -> rank`. A parent whose variants all draw its children in one
 * order has none, and neither has a child its auto layout does not place (Tooltip's arrow, placed
 * by position, however Figma lists it).
 *
 * @param {Array<{name: string, layers: Map<string, object>, parents: Map<string, string>}>} variants
 * @returns {Map<string, Map<string, number>>}
 */
export function ordersOf(variants) {
  const flow = (v) => {
    const byParent = new Map();
    for (const [path, layer] of v.layers) {
      const parent = v.parents.get(path);
      if (parent == null || layer.position) continue;
      byParent.set(parent, [...(byParent.get(parent) ?? []), path]);
    }
    return byParent;
  };
  const flows = variants.map((v) => [v.name, flow(v)]);
  // Two siblings one variant lays out one way round and another the other.
  const before = new Map();
  const reorders = new Set();
  for (const [, byParent] of flows)
    for (const [parent, children] of byParent)
      children.forEach((a, i) => {
        for (const b of children.slice(i + 1)) {
          if (before.get(`${b}|${a}`)) reorders.add(parent);
          before.set(`${a}|${b}`, true);
        }
      });
  const ranks = new Map();
  for (const [name, byParent] of flows)
    for (const parent of reorders)
      (byParent.get(parent) ?? []).forEach((path, rank) => {
        if (!ranks.has(path)) ranks.set(path, new Map());
        ranks.get(path).set(name, rank);
      });
  return ranks;
}
