/**
 * The tokens the workbench offers for a cell (docs/superpowers/specs/2026-09-27-viewer-workbench-design.md,
 * Inspect): the semantic tokens of the kind of the cell's current token, primitives never, each with
 * its value as a person reads it. Where the cell has no token, the kind its cell names.
 */

import { flattenSpec } from '../spec.mjs';

/** Spacing is one kind whichever scale names it: a gap is often an inset, a padding a stack. */
const SPACING = new Set(['inset', 'stack']);

/** A token's kind: its type, and for a dimension the scale it belongs to. */
export function kindOf(token) {
  if (token.type !== 'dimension') return token.type;
  const group = token.name.split('.')[0];
  return SPACING.has(group) ? 'spacing' : group;
}

const SIDES = ['Top', 'Right', 'Bottom', 'Left'];

/** The kinds a cell takes where it has no token to go by; none for a position. */
const CELL_KINDS = {
  background: ['color'],
  borderColor: ['color'],
  color: ['color'],
  typography: ['typography'],
  shadow: ['shadow'],
  gap: ['spacing'],
  ...Object.fromEntries(SIDES.map((s) => [`padding${s}`, ['spacing']])),
  radius: ['radius'],
  radiusTopLeft: ['radius'],
  radiusTopRight: ['radius'],
  radiusBottomRight: ['radius'],
  radiusBottomLeft: ['radius'],
  borderWidth: ['border'],
  ...Object.fromEntries(SIDES.map((s) => [`border${s}Width`, ['border']])),
  width: ['size', 'icon', 'layout'],
  height: ['size', 'icon', 'layout'],
};

/** The cells a sizing keyword (`FILL`, `HUG`) may be set on. */
export const KEYWORD_CELLS = new Set(['width', 'height']);

/** The pairs of modes a token's value may differ by: the theme's, and the breakpoint's. */
const MODE_PAIRS = [
  ['light', 'dark'],
  ['desktop', 'mobile'],
];

/** One value as text: a text style as its size, line height and weight. */
function formatValue(token, v) {
  if (token.type === 'typography')
    return `${v.fontSize}/${v.lineHeight} ${v.fontWeight}`;
  return typeof v === 'object' ? JSON.stringify(v) : String(v);
}

/**
 * A token's value as text: a colour's Light and Dark, a text style's size, line height and weight,
 * at Desktop and Mobile where they differ (a mode may hold only the parts it changes, over the
 * token's value).
 */
export function valueText(token) {
  const modes = token.modes;
  for (const [a, b] of MODE_PAIRS) {
    if (modes?.[a] === undefined || modes?.[b] === undefined) continue;
    const at = (mode) =>
      formatValue(
        token,
        typeof modes[mode] === 'object' && typeof token.value === 'object'
          ? { ...token.value, ...modes[mode] }
          : modes[mode],
      );
    return at(a) === at(b) ? at(a) : `${at(a)} / ${at(b)}`;
  }
  return formatValue(token, token.value);
}

/**
 * @param {object} tokens the token spec (`stage.build().tokens`)
 * @param {string} cell an IR cell (`background`, `paddingLeft`, `typography`)
 * @param {string | null} current the token the cell names now, if any
 * @returns {{name: string, value: string}[]} in the token spec's order
 */
export function tokenChoices(tokens, cell, current) {
  const semantic = flattenSpec(tokens).filter(
    (t) => t.ext?.tier === 'semantic',
  );
  const now = current && semantic.find((t) => t.name === current);
  const kinds = now ? [kindOf(now)] : (CELL_KINDS[cell] ?? []);
  return semantic
    .filter((t) => kinds.includes(kindOf(t)))
    .map((t) => ({ name: t.name, value: valueText(t) }));
}
