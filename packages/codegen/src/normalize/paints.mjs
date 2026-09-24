/**
 * What one stack of Figma paints draws, read the same way by the recipe and the oracle: it is a
 * fact about Figma's drawing, not a design decision.
 *
 * Figma lists a layer's paints bottom first, and the fetcher drops hidden ones. One paint is that
 * paint. A stack is one paint when its top paint is an opaque colour, which covers everything
 * under it: Insight Card's selected card fills `surface/background` over `surface/base`, and only
 * the grey is ever seen. A translucent top shows what is under it, which one colour cannot say,
 * so it fails naming the layer.
 *
 * @param {string[]} paints the fetcher's paints, `{Color:…}` references or `#rrggbb[ a=…]` literals
 * @param {{variable: (figma: string) => string | null, opaque: (doc: string) => boolean}} names
 * @param {string} where the layer and cell, for the error
 * @returns {{paint: string, covered: string[]}} the paint drawn, and the ones it covers
 */
export function drawnPaint(paints, names, where) {
  if (paints.length === 1) return { paint: paints[0], covered: [] };
  const top = paints.at(-1);
  if (!isOpaque(top, names))
    throw new Error(
      `${where}: ${paints.length} paints, and the top one (${top}) is not an opaque colour, so they cannot be drawn as one`,
    );
  return { paint: top, covered: paints.slice(0, -1) };
}

/** Whether a paint hides what is under it: an opaque literal, or a colour token opaque in every mode. */
function isOpaque(paint, names) {
  const ref = /^\{(.+)\}$/.exec(paint);
  if (!ref) return /^#[0-9a-f]{6}$/i.test(paint);
  const doc = names.variable(ref[1]);
  return doc !== null && names.opaque(doc);
}
