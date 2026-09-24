/**
 * Where a layer its parent's auto layout does not place sits, and from which of the parent's
 * edges. Figma records where a layer is, not what it is pinned to: along an axis the parent grows
 * on (it fills or hugs, so its size is not the one drawn), a layer keeps its distance from the
 * parent's nearer edge -- Text Area's send button, 8px in from the field's right, stays in that
 * corner however wide the field is. Along a fixed axis the two are one, and the place is kept from
 * the left and the top.
 *
 * Read from Figma alone, so the recipe (recipe.mjs) and the oracle (verify/oracle.mjs) both place a
 * layer by it, and neither reads the other.
 */

/** A layer's sizing per axis, `FILL`, `HUG` or `FIXED`, from its auto layout or its parent's. */
const sizingOf = (layer) =>
  (layer?.layout?.sizing ?? layer?.sizing)?.split('/') ?? [];

/** A distance, clear of Figma's float noise, as positions are drawn. */
const clean = (n) => Math.round(n * 1e4) / 1e4;

/** Along axis `i`: whether the layer is nearer its parent's far edge, in a parent that grows. */
function nearerFar(layer, parent, i) {
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
 * pinned to (farEdgesOf); nothing where its parent's auto layout places it.
 *
 * @returns {{x?: number, y?: number, right?: number, bottom?: number}}
 */
export function placementOf(layer, parent, far = [false, false]) {
  if (!layer.position) return {};
  const out = {};
  [
    ['x', 'right'],
    ['y', 'bottom'],
  ].forEach(([near, farCell], i) => {
    const at = layer.position[i];
    if (far[i])
      out[farCell] = clean(parent.size[i] - at - (layer.size?.[i] ?? 0));
    else out[near] = at;
  });
  return out;
}
