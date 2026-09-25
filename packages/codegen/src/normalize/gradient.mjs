/**
 * A linear gradient, as the fetcher records one (docs/solar-web/raw/fetch-rest.mjs) and as the
 * recipe, the emitters and the oracle read it: its start and end handles as fractions of the
 * layer's box, and each stop's paint at its place between them, 0 to 1:
 *
 *   linear-gradient(0,0.68 → 1,0.68: {Primitives:color/alpha/transparent} 0%, {Color:surface/base} 100%)
 *
 * SOLAR draws four in SOLAR Web (Table's mobile fades and one in App Switcher, 2026-09-25), each
 * straight across or down its box, so a gradient that runs any other way fails naming the layer
 * rather than being drawn at a guessed angle.
 */

const SHAPE =
  /^linear-gradient\((-?[\d.]+),(-?[\d.]+) → (-?[\d.]+),(-?[\d.]+): (.*)\)$/;

/**
 * @param {string} paint one of the fetcher's paints
 * @returns {null | {from: number[], to: number[], stops: {paint: string, position: number}[]}}
 *   the gradient, or null where the paint is none
 */
export function parseGradient(paint) {
  const m = SHAPE.exec(paint);
  if (!m) return null;
  const stops = m[5].split(', ').map((s) => {
    const i = s.lastIndexOf(' ');
    return {
      paint: s.slice(0, i),
      position: Number.parseFloat(s.slice(i + 1)) / 100,
    };
  });
  return { from: [+m[1], +m[2]], to: [+m[3], +m[4]], stops };
}

/**
 * Where a gradient runs, as CSS names it (`to right`), and where a stop at `p` of the way from
 * Figma's start handle to its end handle sits along that line, 0 to 1: CSS's line across a box
 * runs from edge to edge, where Figma's handles may stop short of them.
 *
 * @param {{from: number[], to: number[]}} gradient
 * @param {string} where the layer, for the error
 * @returns {{direction: string, place: (p: number) => number}}
 */
export function runOf({ from, to }, where) {
  const [x0, y0] = from;
  const [x1, y1] = to;
  const along = (a0, a1, forward) => (p) => {
    const at = a0 + p * (a1 - a0);
    return forward ? at : 1 - at;
  };
  if (Math.abs(y0 - y1) < 0.01 && x0 !== x1)
    return {
      direction: x1 > x0 ? 'to right' : 'to left',
      place: along(x0, x1, x1 > x0),
    };
  if (Math.abs(x0 - x1) < 0.01 && y0 !== y1)
    return {
      direction: y1 > y0 ? 'to bottom' : 'to top',
      place: along(y0, y1, y1 > y0),
    };
  throw new Error(
    `${where}: a gradient from ${from} to ${to} runs neither across nor down its box, which the recipe cannot draw yet`,
  );
}

/** A place along a gradient's line as CSS writes it: `0%`, `37.5%`. */
export const percent = (at) => `${+(at * 100).toFixed(2)}%`;
