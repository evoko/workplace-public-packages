/**
 * Compares what a browser computed with what the oracle says Figma draws. Pure functions of the
 * two, so they are unit-tested on their own (compare.test.mjs) as well as used by the visual spec.
 */

/** A CSS or oracle colour as [r, g, b, a], a in 0..1; `transparent` and `none` are clear. */
export function rgba(value) {
  const v = String(value).trim().toLowerCase();
  if (v === 'transparent' || v === 'none') return [0, 0, 0, 0];
  let m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/.exec(v);
  if (m)
    return [
      ...[0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)),
      m[2] === undefined ? 1 : parseInt(m[2], 16) / 255,
    ];
  m =
    /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/.exec(
      v,
    );
  if (m) {
    const a =
      m[4] === undefined
        ? 1
        : m[4].endsWith('%')
          ? Number(m[4].slice(0, -1)) / 100
          : Number(m[4]);
    return [Number(m[1]), Number(m[2]), Number(m[3]), a];
  }
  throw new Error(`not a colour: ${value}`);
}

/** Two colours agree within a step of 8-bit rounding; two clear colours agree whatever their RGB. */
export function sameColour(a, b) {
  const [x, y] = [rgba(a), rgba(b)];
  if (x[3] < 0.005 && y[3] < 0.005) return true;
  return (
    x.slice(0, 3).every((c, i) => Math.abs(c - y[i]) <= 1) &&
    Math.abs(x[3] - y[3]) <= 0.01
  );
}

/** A length in pixels; `normal` is 0 for spacing, and anything else unreadable is NaN. */
export function pixels(value) {
  if (typeof value === 'number') return value;
  const v = String(value).trim();
  if (v === 'normal' || v === '0') return 0;
  const m = /^(-?[\d.]+)px$/.exec(v);
  return m ? Number(m[1]) : NaN;
}

/** A `box-shadow` value, CSS's order or Figma's, as [{x, y, blur, spread, colour}]. */
export function shadows(value) {
  const v = String(value).trim();
  if (v === 'none' || v === '') return [];
  // Split on the commas between shadows, not the ones inside a colour function.
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < v.length; i++) {
    if (v[i] === '(') depth++;
    if (v[i] === ')') depth--;
    if (v[i] === ',' && depth === 0) {
      parts.push(v.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(v.slice(start));
  return parts.map((part) => {
    const colour =
      /(rgba?\([^)]*\)|#[0-9a-f]{3,8})/i.exec(part)?.[1] ?? 'transparent';
    const [x = 0, y = 0, blur = 0, spread = 0] = part
      .replace(colour, '')
      .trim()
      .split(/\s+/)
      .filter((t) => /px$|^0$/.test(t))
      .map(pixels);
    return { x, y, blur, spread, colour };
  });
}

function sameShadow(a, b) {
  const [x, y] = [shadows(a), shadows(b)];
  return (
    x.length === y.length &&
    x.every(
      (s, i) =>
        ['x', 'y', 'blur', 'spread'].every(
          (k) => Math.abs(s[k] - y[i][k]) <= 0.5,
        ) && sameColour(s.colour, y[i].colour),
    )
  );
}

/** Splits a CSS list on its commas, not the ones inside a colour function. */
function listOf(v) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < v.length; i++) {
    if (v[i] === '(') depth++;
    if (v[i] === ')') depth--;
    if (v[i] === ',' && depth === 0) {
      parts.push(v.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(v.slice(start).trim());
  return parts;
}

/**
 * A `linear-gradient(…)`, the browser's or the oracle's, as its direction and its stops, each a
 * colour at a place in percent; null for a value that is none.
 */
export function gradient(value) {
  const m = /^linear-gradient\((.*)\)$/.exec(String(value).trim());
  if (!m) return null;
  const parts = listOf(m[1]);
  const direction = /^(to |-?[\d.]+deg$)/.test(parts[0])
    ? parts.shift()
    : 'to bottom';
  const stops = parts.map((p) => {
    const i = p.lastIndexOf(' ');
    return { colour: p.slice(0, i), at: Number.parseFloat(p.slice(i + 1)) };
  });
  return { direction, stops };
}

/** Two gradients agree: one direction, and each stop's colour and place, within rounding. */
function sameGradient(a, b) {
  const [x, y] = [gradient(a), gradient(b)];
  return Boolean(
    x &&
    y &&
    x.direction === y.direction &&
    x.stops.length === y.stops.length &&
    x.stops.every(
      (s, i) =>
        Math.abs(s.at - y.stops[i].at) <= 0.5 &&
        sameColour(s.colour, y.stops[i].colour),
    ),
  );
}

/** The first family in a CSS font-family list, unquoted. */
const firstFamily = (list) =>
  String(list)
    .split(',')[0]
    .trim()
    .replace(/^["']|["']$/g, '');

/**
 * Whether a rendered value is what the oracle expects for a property.
 * @returns {boolean}
 */
export function matches(property, figma, rendered) {
  switch (property) {
    case 'background':
      // A gradient is compared as one (Table's fade); a colour as a colour.
      if (String(figma).startsWith('linear-gradient('))
        return sameGradient(figma, rendered);
      return sameColour(figma, rendered);
    case 'borderColor':
    case 'color':
      return sameColour(figma, rendered);
    case 'shadow':
      return sameShadow(figma, rendered);
    case 'fontFamily':
      return firstFamily(rendered) === figma;
    case 'fontWeight':
      return Number(rendered) === Number(figma);
    case 'textDecoration':
      return String(rendered).split(' ')[0] === figma;
    case 'letterSpacing':
      return Math.abs(pixels(rendered) - figma) <= 0.02;
    case 'opacity':
      return Math.abs(Number(rendered) - figma) <= 0.01;
    case 'words':
      return rendered === figma;
    default:
      return Math.abs(pixels(rendered) - figma) <= 0.5;
  }
}

/** The oracle properties a renderer is measured on; the rest describe composition. */
export const MEASURED = [
  'background',
  'borderColor',
  'borderWidth',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'radius',
  'radiusTopLeft',
  'radiusTopRight',
  'radiusBottomRight',
  'radiusBottomLeft',
  'shadow',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'gap',
  'width',
  'height',
  'x',
  'y',
  'right',
  'bottom',
  'opacity',
  'color',
  'fontFamily',
  'fontWeight',
  'fontSize',
  'lineHeight',
  'letterSpacing',
  'textDecoration',
  'words',
];

/**
 * Every measured property of one layer, as failures and excused gaps.
 *
 * @param {object} expected the oracle's layer
 * @param {object} rendered the browser's computed values for that layer
 * @param {object[]} excused the variant's excused entries for this layer
 */
export function compareLayer(expected, rendered, excused = []) {
  const failures = [];
  const gaps = [];
  for (const property of MEASURED) {
    if (!(property in expected)) continue;
    const figma = expected[property];
    const got = rendered[property];
    // An excused entry is a gap even where nothing is drawn, so every excuse is seen reached.
    const excuse = excused.find((e) => e.property === property);
    if (!excuse && property === 'borderColor' && expected.borderWidth === 0)
      // A border colour on no border is not drawn.
      continue;
    if (excuse) {
      gaps.push({
        property,
        figma,
        rendered: got,
        finding: excuse.finding,
        decision: excuse.decision,
      });
      continue;
    }
    const want = rounded(property, figma, rendered);
    const drawn = CORNERS.has(property)
      ? rounded(property, pixels(got), rendered)
      : got;
    if (!matches(property, want, drawn))
      failures.push({ property, figma, rendered: got });
  }
  return { failures, gaps };
}

const CORNERS = new Set([
  'radius',
  'radiusTopLeft',
  'radiusTopRight',
  'radiusBottomRight',
  'radiusBottomLeft',
]);

/**
 * A corner no rounder than its box allows: no corner is drawn rounder than half the box's shorter
 * side, in CSS, in Flutter or in Figma, so a pill's 9999 and an ellipse's half its size draw the
 * same round. Compared as drawn, where the box was measured.
 */
function rounded(property, figma, rendered) {
  const [width, height] = [pixels(rendered.width), pixels(rendered.height)];
  if (!CORNERS.has(property) || !(width > 0) || !(height > 0)) return figma;
  return Math.min(figma, width / 2, height / 2);
}
