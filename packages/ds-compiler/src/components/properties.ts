import valueParser from 'postcss-value-parser';
import type { IRValueLiteral } from '../ir/types.js';
import type { TokenCategory } from '../tokens/categories.js';
import { parseDimension, parseNumber } from '../tokens/values.js';

export type LiteralKind = 'dimension' | 'number' | 'identifier-list';

export interface PropertySpec {
  /** Token categories accepted via var(). Empty when the property never takes a token. */
  categories: readonly TokenCategory[];
  /** When true, only a token reference or one of `literals` is accepted. */
  tokenRequired: boolean;
  /** Exact keyword literals accepted. */
  literals: readonly string[];
  /** Free-form literal kinds accepted (only meaningful when tokenRequired is false). */
  literalKinds: readonly LiteralKind[];
}

const token = (
  categories: readonly TokenCategory[],
  literals: readonly string[] = [],
): PropertySpec => ({
  categories,
  tokenRequired: true,
  literals,
  literalKinds: [],
});

const keyword = (literals: readonly string[]): PropertySpec => ({
  categories: [],
  tokenRequired: false,
  literals,
  literalKinds: [],
});

const free = (
  categories: readonly TokenCategory[],
  literalKinds: readonly LiteralKind[],
  literals: readonly string[] = [],
): PropertySpec => ({
  categories,
  tokenRequired: false,
  literals,
  literalKinds,
});

const COLOR_ESCAPES = ['transparent', 'currentColor', 'inherit'] as const;
const SIDES = ['top', 'right', 'bottom', 'left'] as const;
const CORNERS = [
  'top-left',
  'top-right',
  'bottom-right',
  'bottom-left',
] as const;
const SIZE_KEYWORDS = [
  'auto',
  'none',
  'fit-content',
  'max-content',
  'min-content',
] as const;
const ALIGN = [
  'stretch',
  'center',
  'flex-start',
  'flex-end',
  'start',
  'end',
  'baseline',
] as const;
const JUSTIFY = [
  'center',
  'flex-start',
  'flex-end',
  'start',
  'end',
  'space-between',
  'space-around',
  'space-evenly',
  'stretch',
] as const;

export const PROPERTY_TABLE: Record<string, PropertySpec> = {
  // colors
  color: token(['color'], COLOR_ESCAPES),
  'background-color': token(['color'], COLOR_ESCAPES),
  'outline-color': token(['color'], COLOR_ESCAPES),
  'caret-color': token(['color'], COLOR_ESCAPES),
  'text-decoration-color': token(['color'], COLOR_ESCAPES),
  fill: token(['color'], COLOR_ESCAPES),
  stroke: token(['color'], COLOR_ESCAPES),
  ...Object.fromEntries(
    SIDES.map((s) => [`border-${s}-color`, token(['color'], COLOR_ESCAPES)]),
  ),
  // spacing
  ...Object.fromEntries(
    SIDES.map((s) => [`padding-${s}`, token(['space'], ['0'])]),
  ),
  ...Object.fromEntries(
    SIDES.map((s) => [`margin-${s}`, token(['space'], ['0', 'auto'])]),
  ),
  'row-gap': token(['space'], ['0']),
  'column-gap': token(['space'], ['0']),
  'outline-offset': token(['space'], ['0']),
  'text-underline-offset': token(['space'], ['auto']),
  ...Object.fromEntries(
    SIDES.map((s) => [s, token(['space', 'size'], ['0', 'auto'])]),
  ),
  // radius
  ...Object.fromEntries(
    CORNERS.map((c) => [`border-${c}-radius`, token(['radius'], ['0'])]),
  ),
  // borders and outlines
  ...Object.fromEntries(
    SIDES.map((s) => [`border-${s}-width`, token(['border-width'], ['0'])]),
  ),
  ...Object.fromEntries(
    SIDES.map((s) => [
      `border-${s}-style`,
      keyword(['none', 'solid', 'dashed', 'dotted']),
    ]),
  ),
  'outline-width': token(['border-width'], ['0']),
  'outline-style': keyword(['none', 'solid', 'dashed', 'dotted', 'auto']),
  'stroke-width': free(['border-width'], ['number', 'dimension']),
  'text-decoration-thickness': token(['border-width'], ['auto', 'from-font']),
  // typography
  'font-family': token(['font-family']),
  'font-size': token(['font-size']),
  'font-weight': token(['font-weight']),
  'line-height': token(['line-height'], ['normal']),
  'letter-spacing': token(['letter-spacing'], ['normal']),
  'font-style': keyword(['normal', 'italic']),
  'text-align': keyword(['left', 'right', 'center', 'start', 'end', 'justify']),
  'vertical-align': keyword([
    'baseline',
    'middle',
    'top',
    'bottom',
    'text-top',
    'text-bottom',
  ]),
  'text-transform': keyword(['none', 'uppercase', 'lowercase', 'capitalize']),
  'text-decoration-line': keyword(['none', 'underline', 'line-through']),
  'text-decoration-style': keyword(['solid', 'dashed', 'dotted', 'wavy']),
  'white-space': keyword(['normal', 'nowrap', 'pre', 'pre-wrap', 'pre-line']),
  'text-overflow': keyword(['clip', 'ellipsis']),
  // effects and motion
  'box-shadow': token(['shadow'], ['none']),
  opacity: free(['opacity'], ['number']),
  'transition-property': free([], ['identifier-list'], ['none', 'all']),
  'transition-duration': token(['duration']),
  'transition-delay': token(['duration']),
  'transition-timing-function': token(['easing']),
  // sizing
  width: free(['size', 'space'], ['dimension'], SIZE_KEYWORDS),
  height: free(['size', 'space'], ['dimension'], SIZE_KEYWORDS),
  'min-width': free(['size', 'space'], ['dimension'], SIZE_KEYWORDS),
  'min-height': free(['size', 'space'], ['dimension'], SIZE_KEYWORDS),
  'max-width': free(['size', 'space'], ['dimension'], SIZE_KEYWORDS),
  'max-height': free(['size', 'space'], ['dimension'], SIZE_KEYWORDS),
  'flex-basis': free(['size', 'space'], ['dimension'], SIZE_KEYWORDS),
  'flex-grow': free([], ['number']),
  'flex-shrink': free([], ['number']),
  order: free([], ['number']),
  'z-index': free(['z-index'], ['number'], ['auto']),
  // layout
  display: keyword([
    'none',
    'block',
    'inline',
    'inline-block',
    'flex',
    'inline-flex',
    'grid',
    'inline-grid',
    'contents',
  ]),
  position: keyword(['static', 'relative', 'absolute', 'fixed', 'sticky']),
  'box-sizing': keyword(['border-box', 'content-box']),
  'align-items': keyword(ALIGN),
  'align-self': keyword([...ALIGN, 'auto']),
  'align-content': keyword(JUSTIFY),
  'justify-content': keyword(JUSTIFY),
  'justify-items': keyword(JUSTIFY),
  'justify-self': keyword([...JUSTIFY, 'auto']),
  'flex-direction': keyword(['row', 'row-reverse', 'column', 'column-reverse']),
  'flex-wrap': keyword(['nowrap', 'wrap', 'wrap-reverse']),
  overflow: keyword(['visible', 'hidden', 'clip', 'scroll', 'auto']),
  'overflow-x': keyword(['visible', 'hidden', 'clip', 'scroll', 'auto']),
  'overflow-y': keyword(['visible', 'hidden', 'clip', 'scroll', 'auto']),
  visibility: keyword(['visible', 'hidden', 'collapse']),
  'object-fit': keyword(['contain', 'cover', 'fill', 'none', 'scale-down']),
  'border-collapse': keyword(['collapse', 'separate']),
  'list-style-type': keyword(['none', 'disc', 'decimal']),
  'background-image': keyword(['none']),
  // interaction
  cursor: keyword([
    'auto',
    'default',
    'pointer',
    'not-allowed',
    'text',
    'move',
    'grab',
    'grabbing',
    'wait',
    'progress',
    'help',
    'crosshair',
    'none',
  ]),
  appearance: keyword(['none', 'auto']),
  'pointer-events': keyword(['none', 'auto']),
  'user-select': keyword(['none', 'auto', 'text', 'all']),
  resize: keyword(['none', 'both', 'horizontal', 'vertical']),
};

/** Shorthands whose expansion is ambiguous for translation. Using them is DS-E045. */
export const FORBIDDEN_SHORTHANDS: ReadonlySet<string> = new Set([
  'border',
  'border-top',
  'border-right',
  'border-bottom',
  'border-left',
  'border-block',
  'border-inline',
  'background',
  'font',
  'transition',
  'animation',
  'outline',
  'flex',
  'inset',
  'text-decoration',
  'place-items',
  'place-content',
  'grid',
  'grid-template',
  'grid-area',
  'columns',
  'list-style',
  'overflow-block',
  'overflow-inline',
]);

interface Expansion {
  longhands: readonly string[];
  /** Maps N provided values to one per longhand, or null when N is invalid. */
  spread: (values: string[]) => string[] | null;
  range: string;
}

function fourSides(values: string[]): string[] | null {
  switch (values.length) {
    case 1:
      return [values[0], values[0], values[0], values[0]];
    case 2:
      return [values[0], values[1], values[0], values[1]];
    case 3:
      return [values[0], values[1], values[2], values[1]];
    case 4:
      return values;
    default:
      return null;
  }
}

function twoValues(values: string[]): string[] | null {
  switch (values.length) {
    case 1:
      return [values[0], values[0]];
    case 2:
      return values;
    default:
      return null;
  }
}

const EXPANSIONS: Record<string, Expansion> = {
  padding: {
    longhands: SIDES.map((s) => `padding-${s}`),
    spread: fourSides,
    range: '1 to 4',
  },
  margin: {
    longhands: SIDES.map((s) => `margin-${s}`),
    spread: fourSides,
    range: '1 to 4',
  },
  'border-width': {
    longhands: SIDES.map((s) => `border-${s}-width`),
    spread: fourSides,
    range: '1 to 4',
  },
  'border-style': {
    longhands: SIDES.map((s) => `border-${s}-style`),
    spread: fourSides,
    range: '1 to 4',
  },
  'border-color': {
    longhands: SIDES.map((s) => `border-${s}-color`),
    spread: fourSides,
    range: '1 to 4',
  },
  'border-radius': {
    longhands: CORNERS.map((c) => `border-${c}-radius`),
    spread: fourSides,
    range: '1 to 4',
  },
  gap: {
    longhands: ['row-gap', 'column-gap'],
    spread: twoValues,
    range: '1 to 2',
  },
};

export type ExpansionResult =
  | { ok: true; declarations: Record<string, string> }
  | { ok: false; reason: string };

/**
 * Splits a value on top-level whitespace, keeping function calls like var( --x ) intact.
 * Returns null when a top-level "," or "/" divider is present.
 */
export function splitTopLevel(value: string): string[] | null {
  const parts: string[] = [];
  for (const node of valueParser(value).nodes) {
    if (node.type === 'space' || node.type === 'comment') {
      continue;
    }
    if (node.type === 'div') {
      return null;
    }
    parts.push(valueParser.stringify(node));
  }
  return parts;
}

/** Returns null when `prop` is not an expandable shorthand. */
export function expandShorthand(
  prop: string,
  value: string,
): ExpansionResult | null {
  const expansion = EXPANSIONS[prop];
  if (!expansion) {
    return null;
  }
  const values = splitTopLevel(value);
  if (values === null) {
    return {
      ok: false,
      reason: '"," and "/" are not allowed in this shorthand',
    };
  }
  const spread = expansion.spread(values);
  if (!spread) {
    return {
      ok: false,
      reason: `expected ${expansion.range} values, got ${values.length}`,
    };
  }
  const declarations: Record<string, string> = {};
  expansion.longhands.forEach((longhand, i) => {
    declarations[longhand] = spread[i];
  });
  return { ok: true, declarations };
}

/** Properties a base root rule should declare so parity never rests on user-agent defaults. */
export const BASELINE_PROPERTIES: readonly string[] = [
  'appearance',
  'box-sizing',
  'background-color',
  'color',
  'font-family',
  'font-size',
  'line-height',
  'border-top-style',
  'border-right-style',
  'border-bottom-style',
  'border-left-style',
];

const IDENTIFIER_LIST = /^[a-z][a-z0-9-]*(\s*,\s*[a-z][a-z0-9-]*)*$/;

/** Parses a non-token value for a property. Returns null when it is not allowed. */
export function parseLiteralForProperty(
  prop: string,
  raw: string,
): IRValueLiteral | null {
  const spec = PROPERTY_TABLE[prop];
  if (!spec) {
    return null;
  }
  const text = raw.trim();
  const match = spec.literals.find(
    (l) => l.toLowerCase() === text.toLowerCase(),
  );
  if (match) {
    return { kind: 'literal', type: 'keyword', value: match };
  }
  for (const kind of spec.literalKinds) {
    switch (kind) {
      case 'dimension': {
        const dim = parseDimension(text);
        if (dim) {
          return { kind: 'literal', type: 'dimension', value: dim };
        }
        break;
      }
      case 'number': {
        const num = parseNumber(text);
        if (num) {
          return { kind: 'literal', type: 'number', value: num.value };
        }
        break;
      }
      case 'identifier-list': {
        if (IDENTIFIER_LIST.test(text)) {
          const normalized = text
            .split(',')
            .map((s) => s.trim())
            .join(', ');
          return { kind: 'literal', type: 'string', value: normalized };
        }
        break;
      }
    }
  }
  return null;
}
