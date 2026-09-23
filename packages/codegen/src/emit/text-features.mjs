/**
 * Text decoration and case: the two text style properties that are not sizes.
 *
 * Figma states them as enums on the style (UNDERLINE, UPPER …), and they reach the spec under a
 * typography token's `$extensions` because DTCG's typography composite has no field for either.
 * This is the one mapping from Figma's enums to each target, so the MUI theme and the component
 * recipes cannot disagree about what `link/md/hover` looks like.
 */

const CSS_DECORATION = {
  NONE: 'none',
  UNDERLINE: 'underline',
  STRIKETHROUGH: 'line-through',
};

// Figma's case is a mix of what CSS calls text-transform and font-variant-caps.
const CSS_CASE = {
  ORIGINAL: {},
  UPPER: { textTransform: 'uppercase' },
  LOWER: { textTransform: 'lowercase' },
  TITLE: { textTransform: 'capitalize' },
  SMALL_CAPS: { fontVariantCaps: 'small-caps' },
  SMALL_CAPS_FORCED: { fontVariantCaps: 'all-small-caps' },
};

const DART_DECORATION = {
  NONE: null,
  UNDERLINE: 'TextDecoration.underline',
  STRIKETHROUGH: 'TextDecoration.lineThrough',
};

const known = (table, value, what) => {
  if (!(value in table)) throw new Error(`unknown text ${what}: ${value}`);
  return table[value];
};

/** The decoration and case a typography token's extensions carry, or {} when they carry none. */
export const featuresOf = (ext) => ({
  ...(ext?.textDecoration !== undefined && {
    textDecoration: ext.textDecoration,
  }),
  ...(ext?.textCase !== undefined && { textCase: ext.textCase }),
});

/**
 * CSS declarations for a style's decoration and case.
 *
 * `explicit` writes `text-decoration: none` rather than leaving it out. A theme variant omits it,
 * since nothing is reset there; a component recipe needs it, because a state that switches from an
 * underlined style back to a plain one has to undo the underline.
 */
export function cssTextFeatures(features, { explicit = false } = {}) {
  const out = {};
  if (features.textDecoration !== undefined) {
    const d = known(CSS_DECORATION, features.textDecoration, 'decoration');
    if (explicit || d !== 'none') out.textDecoration = d;
  } else if (explicit) out.textDecoration = 'none';
  if (features.textCase !== undefined)
    Object.assign(out, known(CSS_CASE, features.textCase, 'case'));
  return out;
}

/** The Dart `decoration:` argument, or null when there is none to draw. */
export const dartDecoration = (features) =>
  features.textDecoration === undefined
    ? null
    : known(DART_DECORATION, features.textDecoration, 'decoration');

/**
 * One decoration from any target's spelling, for parity: Figma's enum, the CSS keyword, or the
 * Dart constant. Absent means none.
 */
export function canonicalDecoration(value) {
  if (value === undefined || value === null) return 'none';
  const v = String(value);
  for (const [figma, css] of Object.entries(CSS_DECORATION))
    if (v === figma || v === css || v === DART_DECORATION[figma]) return css;
  throw new Error(`cannot parse text decoration: ${v}`);
}
