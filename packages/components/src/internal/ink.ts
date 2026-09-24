/**
 * The ink for text on a colour the caller chose: Avatar's initials on the caller's colour.
 *
 * Owner decision, 2026-09-24: the initials take the colour's hue, as Figma's samples do (the 700
 * on the 50, the 100 on the 800), as vivid as sRGB holds, at a lightness far enough from it to
 * read. They start at Figma's own lightness (OKLCH 0.37 dark, 0.93 light), on the side that reads
 * better, and move toward black or white only as far as WCAG AA's 4.5:1 needs; where that side
 * cannot reach it, the other does. A grey's ink is a grey. The colour is computed, not a token, since no SOLAR token names text on any colour: a
 * governance gap the design review raises. `solar_ink.dart` is the same rule in Flutter.
 *
 * Hand written and internal. Only a colour it can read is drawn with an ink (`#rgb`, `#rrggbb`,
 * with alpha or not, `rgb()`, `hsl()`); for any other (a `var()`), the caller gives the ink.
 */

type Rgb = [number, number, number];

/** Figma's lightness for a sample's text: its 700 on light colours, its 100 on dark ones. */
const DARK = 0.37;
const LIGHT = 0.93;
/** WCAG 2.1 AA, for text. */
const AA = 4.5;
/**
 * Below this chroma a colour is a grey, and its ink is too; above it the ink is its hue as vivid
 * as sRGB holds at the ink's lightness, as Figma's 700s and 100s are.
 */
const GREY = 0.01;
const VIVID = 0.4;

const lin = (c: number) =>
  c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
const gam = (c: number) =>
  c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;

/** Relative luminance, as WCAG defines it. */
const luminance = ([r, g, b]: Rgb) =>
  0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);

const contrast = (a: Rgb, b: Rgb) => {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

/** sRGB to OKLCH (Björn Ottosson's OKLab). */
function oklch([r, g, b]: Rgb): [number, number, number] {
  const [R, G, B] = [lin(r), lin(g), lin(b)];
  const l = (0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B) ** (1 / 3);
  const m = (0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B) ** (1 / 3);
  const s = (0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B) ** (1 / 3);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const Bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [L, Math.hypot(A, Bb), Math.atan2(Bb, A)];
}

/** OKLCH to linear sRGB, which may lie outside the gamut. */
function linear(L: number, C: number, h: number): Rgb {
  const A = C * Math.cos(h);
  const B = C * Math.sin(h);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

/**
 * The colour at lightness L in the hue h, as much of chroma C as sRGB holds there, in the 8-bit
 * steps it is drawn in, so the contrast weighed is the drawn colour's.
 */
function inGamut(L: number, C: number, h: number): Rgb {
  const fits = (c: number) =>
    linear(L, c, h).every((v) => v >= -1e-6 && v <= 1 + 1e-6);
  let lo = 0;
  let hi = C;
  if (!fits(hi))
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (fits(mid)) lo = mid;
      else hi = mid;
    }
  else lo = hi;
  return linear(L, lo, h).map(
    (v) => Math.round(gam(Math.min(1, Math.max(0, v))) * 255) / 255,
  ) as Rgb;
}

/** From lightness `from` toward `to` (0 or 1), the nearest that reads at AA, or null if none. */
function reaching(bg: Rgb, C: number, h: number, from: number, to: number) {
  const at = (L: number) => inGamut(L, C, h);
  if (contrast(bg, at(from)) >= AA) return at(from);
  if (contrast(bg, at(to)) < AA) return null;
  let near = from;
  let far = to;
  for (let i = 0; i < 24; i++) {
    const mid = (near + far) / 2;
    if (contrast(bg, at(mid)) >= AA) far = mid;
    else near = mid;
  }
  return at(far);
}

/** A CSS colour as sRGB in 0..1, or null for one this does not read. */
export function parseColour(value: string): Rgb | null {
  const v = value.trim().toLowerCase();
  let m = /^#([0-9a-f]{3,4})$/.exec(v);
  if (m)
    return [0, 1, 2].map((i) => parseInt(m![1][i] + m![1][i], 16) / 255) as Rgb;
  m = /^#([0-9a-f]{6})(?:[0-9a-f]{2})?$/.exec(v);
  if (m)
    return [0, 2, 4].map(
      (i) => parseInt(m![1].slice(i, i + 2), 16) / 255,
    ) as Rgb;
  m = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/.exec(v);
  if (m) return [m[1], m[2], m[3]].map((n) => Number(n) / 255) as Rgb;
  m = /^hsla?\(\s*([\d.]+)(?:deg)?[,\s]+([\d.]+)%[,\s]+([\d.]+)%/.exec(v);
  if (m) {
    const [h, s, l] = [
      Number(m[1]) / 360,
      Number(m[2]) / 100,
      Number(m[3]) / 100,
    ];
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue = (t: number) => {
      const u = ((t % 1) + 1) % 1;
      if (u < 1 / 6) return p + (q - p) * 6 * u;
      if (u < 1 / 2) return q;
      if (u < 2 / 3) return p + (q - p) * (2 / 3 - u) * 6;
      return p;
    };
    return [hue(h + 1 / 3), hue(h), hue(h - 1 / 3)];
  }
  return null;
}

/** The ink for text on `colour`, as `rgb(…)`, or null where the colour cannot be read. */
export function inkOn(colour: string): string | null {
  const bg = parseColour(colour);
  if (!bg) return null;
  const [, chroma, h] = oklch(bg);
  const C = chroma < GREY ? 0 : VIVID;
  const dark = inGamut(DARK, C, h);
  const light = inGamut(LIGHT, C, h);
  const sides: Array<[number, number]> =
    contrast(bg, dark) >= contrast(bg, light)
      ? [
          [DARK, 0],
          [LIGHT, 1],
        ]
      : [
          [LIGHT, 1],
          [DARK, 0],
        ];
  for (const [from, to] of sides) {
    const ink = reaching(bg, C, h, from, to);
    if (ink) return `rgb(${ink.map((c) => Math.round(c * 255)).join(' ')})`;
  }
  // One side's extreme always reads at AA on an opaque colour, so this is not reached.
  const ink = inGamut(sides[0][1], C, h);
  return `rgb(${ink.map((c) => Math.round(c * 255)).join(' ')})`;
}
