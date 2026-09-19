import {
  FORBIDDEN_SHORTHANDS,
  expandShorthand,
} from '../../components/properties.js';
import {
  PSEUDO_STATES,
  sortStates,
  stateForAttribute,
} from '../../components/states.js';
import type { Diagnostics, SourceLocation } from '../../errors.js';
import type { ComponentIR, DesignIR } from '../../ir/types.js';
import { codeUnitCompare } from '../../sources.js';
import {
  findRender,
  type MuiCatalogComponent,
  type MuiCatalogRule,
} from './catalog.js';
import { ignoredForMui } from './hints.js';
import type { MappingPlan } from './mapping.js';
import type { MuiDeclarations, MuiVariant } from './model.js';
import { axisPermutations, muiPropertyKey } from './names.js';
import { muiValue } from './values.js';

const SIDES = ['top', 'right', 'bottom', 'left'] as const;
const CORNERS = [
  'top-left',
  'top-right',
  'bottom-right',
  'bottom-left',
] as const;

/** Shorthands MUI is known to emit, to the longhands they set. A shorthand outside this table is DS-E086 at generation. */
export const SHORTHAND_LONGHANDS: Readonly<Record<string, readonly string[]>> =
  {
    padding: SIDES.map((s) => `padding-${s}`),
    margin: SIDES.map((s) => `margin-${s}`),
    inset: [...SIDES],
    gap: ['row-gap', 'column-gap'],
    border: SIDES.flatMap((s) => [
      `border-${s}-width`,
      `border-${s}-style`,
      `border-${s}-color`,
    ]),
    ...Object.fromEntries(
      SIDES.map((s) => [
        `border-${s}`,
        [`border-${s}-width`, `border-${s}-style`, `border-${s}-color`],
      ]),
    ),
    'border-width': SIDES.map((s) => `border-${s}-width`),
    'border-style': SIDES.map((s) => `border-${s}-style`),
    'border-color': SIDES.map((s) => `border-${s}-color`),
    'border-radius': CORNERS.map((c) => `border-${c}-radius`),
    outline: ['outline-width', 'outline-style', 'outline-color'],
    transition: [
      'transition-property',
      'transition-duration',
      'transition-timing-function',
      'transition-delay',
    ],
    background: [
      'background-color',
      'background-image',
      'background-position',
      'background-size',
      'background-repeat',
      'background-attachment',
      'background-origin',
      'background-clip',
    ],
    font: [
      'font-style',
      'font-variant',
      'font-weight',
      'font-stretch',
      'font-size',
      'line-height',
      'font-family',
    ],
    flex: ['flex-grow', 'flex-shrink', 'flex-basis'],
    'flex-flow': ['flex-direction', 'flex-wrap'],
    'text-decoration': [
      'text-decoration-line',
      'text-decoration-style',
      'text-decoration-color',
      'text-decoration-thickness',
    ],
    'place-items': ['align-items', 'justify-items'],
    'place-content': ['align-content', 'justify-content'],
    overflow: ['overflow-x', 'overflow-y'],
  };

/**
 * CSS shorthands not already in `SHORTHAND_LONGHANDS`: a catalog rule that
 * sets one of these must not fall through to being treated as an already
 * atomic longhand (`FORBIDDEN_SHORTHANDS` and `expandShorthand` only know
 * the design system's own authoring tables, which have no entry for a
 * shorthand the design system never lets authors write, like `overflow`
 * before it gained a `SHORTHAND_LONGHANDS` entry above). Reported as
 * DS-E086 instead.
 */
export const KNOWN_SHORTHANDS: ReadonlySet<string> = new Set([
  'overflow',
  'mask',
  'place-self',
  'scroll-margin',
  'scroll-padding',
  'inset-inline',
  'inset-block',
  'margin-inline',
  'margin-block',
  'padding-inline',
  'padding-block',
  'border-block',
  'border-inline',
  'border-image',
  'background-position',
  'grid',
  'grid-template',
  'grid-area',
  'grid-column',
  'grid-row',
  'columns',
  'column-rule',
  'list-style',
  'text-emphasis',
  'overscroll-behavior',
  'animation',
  'container',
  'contain-intrinsic-size',
  'offset',
  'font-variant',
  'font-synthesis',
]);

/**
 * A longhand the design system's own property table only ever lets authors
 * declare through a shorthand parent (`overflow-x`/`overflow-y` values are
 * legal DS properties on their own, but a rule that means "set both" is
 * usually written as `overflow`): consulted by `computeResets` when the
 * longhand itself has no effective design-system value.
 */
const DS_PARENT: Readonly<Record<string, string>> = {
  'overflow-x': 'overflow',
  'overflow-y': 'overflow',
};

const VENDOR = /^-(?:webkit|moz|ms|o)-(.+)$/;
/**
 * Legacy flexbox spellings Emotion's prefixer emits next to the standard
 * property; dropped when the standard property is in the same rule, like a
 * same-name vendor twin. (Seen in the real Button capture: `-ms-flex-align`,
 * `-webkit-box-align` beside `align-items`; `-ms-flex-pack`,
 * `-webkit-box-pack` beside `justify-content`.)
 */
const LEGACY_TWINS: Readonly<Record<string, string>> = {
  '-webkit-box-align': 'align-items',
  '-ms-flex-align': 'align-items',
  '-webkit-box-pack': 'justify-content',
  '-ms-flex-pack': 'justify-content',
  '-webkit-box-orient': 'flex-direction',
  '-webkit-box-direction': 'flex-direction',
  '-ms-flex-direction': 'flex-direction',
  '-ms-flex-wrap': 'flex-wrap',
  '-ms-flex-preferred-size': 'flex-basis',
  '-ms-flex-positive': 'flex-grow',
  '-ms-flex-negative': 'flex-shrink',
  '-ms-flex-item-align': 'align-self',
  '-ms-flex-line-pack': 'align-content',
  '-webkit-box-flex': 'flex-grow',
  '-ms-flex': 'flex',
  '-webkit-box-ordinal-group': 'order',
  '-ms-flex-order': 'order',
};
/**
 * One selector token: a pseudo-class or pseudo-element (its parenthesised
 * argument, if any, kept intact so `:not(.a, .b)` is one token), a class, an
 * attribute selector, `&`, `*`, or a combinator (whitespace and/or `>`/`+`/
 * `~`, e.g. the `>` in `.a>*` or the space in `.a .b`). Anything else (a
 * type selector like `svg`) matches nothing and is silently skipped, same
 * as before.
 */
const TOKEN =
  /::?[a-zA-Z-]+(?:\([^)]*\))?|\.[A-Za-z0-9_-]+|\[[^\]]*\]|&|\*|[ >+~]+/g;
const COMBINATOR_TOKEN = /^[ >+~]+$/;
const ATTRIBUTE = /^\[([a-z-]+)(?:="([^"]*)")?\]$/;
/** `:not(...)`, `:is(...)`, `:has(...)`: specificity is the max of their comma-separated arguments. */
const FUNCTIONAL_PSEUDO = /^:(?:not|is|has)\(([\s\S]*)\)$/i;
/** `:where(...)` always contributes zero specificity. */
const WHERE_PSEUDO = /^:where\(/i;
/** Classes, attributes, and pseudo-classes inside a `:not()`/`:is()`/`:has()` argument; types and `*` are ignored, same as at the top level. */
const INNER_TOKEN = /\.[A-Za-z0-9_-]+|\[[^\]]*\]|:[a-zA-Z-]+(?:\([^)]*\))?/g;
/** MUI state classes to design-system states. */
const CLASS_STATES: Readonly<Record<string, string>> = {
  'Mui-disabled': 'disabled',
  'Mui-focusVisible': 'focus-visible',
  'Mui-active': 'active',
  'Mui-selected': 'selected',
  'Mui-checked': 'checked',
  'Mui-expanded': 'expanded',
};

export interface ResetContext {
  /** `root`, a design-system slot, or null when the subject is not a design-system element (pseudo-element, descendant of a slot, unknown class). */
  slot: string | null;
  /** States implied by the root compound, canonical order. */
  states: string[];
  /** Classes, attributes, and pseudo-classes across all compounds, `&` counting one; pseudo-elements and `*` count nothing. */
  specificity: number;
}

/**
 * Splits a selector into token groups ("compounds"), one per simple
 * selector in the combinator chain: tokenises the whole selector first (so
 * a comma or space inside a functional pseudo-class's argument, `&:is(.a,
 * .b)`, never causes a false split) and starts a new group at each
 * combinator token. A combinator-separated segment with no recognised
 * token (a bare type selector like `svg`) still produces an empty group, so
 * the group count stays accurate for slot detection.
 */
function compoundsOf(selector: string): string[][] {
  const tokens = selector.trim().match(TOKEN) ?? [];
  const compounds: string[][] = [[]];
  for (const token of tokens) {
    if (COMBINATOR_TOKEN.test(token)) {
      compounds.push([]);
      continue;
    }
    compounds[compounds.length - 1].push(token);
  }
  return compounds;
}

/**
 * Specificity contributed by one token: `*` and `:where(...)` contribute
 * zero; `:not(...)`, `:is(...)`, and `:has(...)` contribute the highest
 * specificity among their comma-separated arguments (classes, attributes,
 * and pseudo-classes inside; types and `*` ignored); everything else
 * (`&`, a class, an attribute, a plain pseudo-class) contributes one.
 * Pseudo-elements are handled by the caller before this is reached.
 */
function specificityOfToken(token: string): number {
  if (token === '*') {
    return 0;
  }
  if (WHERE_PSEUDO.test(token)) {
    return 0;
  }
  const functional = FUNCTIONAL_PSEUDO.exec(token);
  if (functional) {
    const counts = functional[1]
      .split(',')
      .map((arg) => (arg.match(INNER_TOKEN) ?? []).length);
    return Math.max(0, ...counts);
  }
  return 1;
}

/**
 * Reads a catalog selector (`&`, `&:hover .MuiButton-startIcon::before`, …).
 * States come from the root compound only; the second compound names a slot
 * when it starts with a mapped slot class; anything deeper, a pseudo-element,
 * or an unknown class has no design-system element.
 */
export function parseContext(
  selector: string,
  slotByClass: Readonly<Record<string, string>>,
): ResetContext {
  const compounds = compoundsOf(selector);
  let specificity = 0;
  let pseudoElement = false;
  const states: string[] = [];
  const count = (token: string): void => {
    if (token.startsWith('::')) {
      pseudoElement = true;
      return;
    }
    specificity += specificityOfToken(token);
  };
  for (const token of compounds[0] ?? ['&']) {
    count(token);
    if (token.startsWith('::') || token === '&' || token === '*') {
      continue;
    }
    if (token.startsWith(':')) {
      const state = PSEUDO_STATES[token.slice(1)];
      if (state) {
        states.push(state);
      }
    } else if (token.startsWith('.')) {
      const state = CLASS_STATES[token.slice(1)];
      if (state) {
        states.push(state);
      }
    } else {
      const attr = ATTRIBUTE.exec(token);
      const state = attr ? stateForAttribute(attr[1], attr[2]) : null;
      if (state) {
        states.push(state);
      }
    }
  }
  let slot: string | null = 'root';
  if (compounds.length >= 2) {
    const second = compounds[1];
    const cls = second[0]?.startsWith('.') ? second[0].slice(1) : null;
    slot =
      cls !== null && Object.hasOwn(slotByClass, cls) ? slotByClass[cls] : null;
    for (const compound of compounds.slice(1)) {
      compound.forEach(count);
    }
    if (compounds.length > 2) {
      slot = null;
    }
  }
  if (pseudoElement) {
    slot = null;
  }
  return { slot, states: sortStates(states), specificity };
}

interface Provided {
  value: string;
  specificity: number;
}

/**
 * The design system's winning declaration for `property` on the context's
 * element in the context's states for this permutation: among every rule
 * whose slot matches, whose axes are all in the permutation, whose states
 * are all in the context, and which declares the property (unless
 * ignored), the one with the highest specificity, IR order breaking a tie
 * (later wins, matching the cascade). IR order is *not* monotone in
 * specificity on its own — `compareRules` sorts by axis count before state
 * count, so a 0-axis/2-state rule sorts before a 1-axis/0-state rule even
 * though the former is more specific — so specificity must be compared
 * explicitly rather than assumed from iteration order. Null when no rule
 * applies or the context has no element.
 */
export function effectiveValue(
  ir: DesignIR,
  component: ComponentIR,
  ignored: ReadonlySet<string>,
  context: ResetContext,
  permutation: Readonly<Record<string, string>>,
  property: string,
): Provided | null {
  if (context.slot === null || ignored.has(property)) {
    return null;
  }
  let found: Provided | null = null;
  for (const rule of component.rules) {
    if (
      rule.slot !== context.slot ||
      !Object.entries(rule.axes).every(([a, v]) => permutation[a] === v) ||
      !rule.states.every((s) => context.states.includes(s)) ||
      !Object.hasOwn(rule.declarations, property)
    ) {
      continue;
    }
    const specificity =
      1 +
      Object.keys(rule.axes).length +
      rule.states.length +
      (rule.slot === 'root' ? 0 : 1);
    if (found === null || specificity >= found.specificity) {
      found = { value: muiValue(ir, rule.declarations[property]), specificity };
    }
  }
  return found;
}

/** The longhands a catalog rule sets: shorthands expanded, Emotion's vendor twins dropped. Reports unexpandable shorthands. */
function longhandsOf(
  rule: MuiCatalogRule,
  name: string,
  at: SourceLocation,
  diag: Diagnostics,
): string[] {
  const present = new Set(Object.keys(rule.declarations));
  const out = new Set<string>();
  for (const prop of Object.keys(rule.declarations)) {
    const vendor = VENDOR.exec(prop);
    if (vendor && present.has(vendor[1])) {
      continue;
    }
    const legacy = LEGACY_TWINS[prop];
    if (legacy !== undefined && present.has(legacy)) {
      continue;
    }
    if (Object.hasOwn(SHORTHAND_LONGHANDS, prop)) {
      SHORTHAND_LONGHANDS[prop].forEach((p) => out.add(p));
      continue;
    }
    if (
      FORBIDDEN_SHORTHANDS.has(prop) ||
      expandShorthand(prop, '0') !== null ||
      KNOWN_SHORTHANDS.has(prop)
    ) {
      diag.add(
        'DS-E086',
        `mui: ${name}: the catalog sets the shorthand "${prop}", which the reset generator cannot expand; add it to SHORTHAND_LONGHANDS in packages/ds-compiler/src/targets/mui/resets.ts and re-run bwp-ds generate`,
        at,
      );
      continue;
    }
    out.add(prop);
  }
  return [...out];
}

function describeAxes(axes: Readonly<Record<string, string>>): string {
  const parts = Object.keys(axes)
    .sort(codeUnitCompare)
    .map((a) => `${a}=${axes[a]}`);
  return parts.length === 0 ? 'the component' : parts.join(', ');
}

/**
 * The leading `variants` entries for a mapped component: for every axis
 * permutation and every catalog rule, one entry keyed by the rule's selector
 * (wrapped in its `@media` when present) whose declarations `revert` each
 * property the design system does not set on that element in that context
 * and restate the design system's effective value where a lower-specificity
 * rule provides it. Properties provided at equal or higher specificity are
 * left to the design-system variants that follow. Null after reporting
 * DS-E086 (missing permutation, unexpandable shorthand).
 */
export function computeResets(
  ir: DesignIR,
  component: ComponentIR,
  plan: MappingPlan,
  catalogComponent: MuiCatalogComponent,
  diag: Diagnostics,
  at: SourceLocation,
): MuiVariant[] | null {
  const before = diag.errors.length;
  const ignored = ignoredForMui(component);
  const slotByClass = Object.fromEntries(
    Object.entries(plan.slotClasses).map(([slot, cls]) => [cls, slot]),
  );
  const out: MuiVariant[] = [];
  for (const permutation of axisPermutations(component)) {
    const render = findRender(catalogComponent, permutation);
    if (!render) {
      diag.add(
        'DS-E086',
        `mui: ${component.name}: the catalog has no render for ${describeAxes(permutation)}; run bwp-ds capture-defaults --target mui`,
        at,
      );
      continue;
    }
    const props = Object.fromEntries(
      component.axisOrder.map((a) => [plan.axisMap[a], permutation[a]]),
    );
    for (const rule of render.rules) {
      const context = parseContext(rule.selector, slotByClass);
      const decls: MuiDeclarations = {};
      for (const property of longhandsOf(rule, component.name, at, diag)) {
        const lookup = property.startsWith('--')
          ? null
          : property.replace(VENDOR, '$1');
        // Consult the longhand first; when the design system has no rule
        // for it, fall back to a shorthand parent it only ever lets authors
        // set atomically (`overflow-x` has no design-system rule of its
        // own, but `overflow` does).
        const provided =
          lookup === null
            ? null
            : (effectiveValue(
                ir,
                component,
                ignored,
                context,
                permutation,
                lookup,
              ) ??
              (DS_PARENT[lookup]
                ? effectiveValue(
                    ir,
                    component,
                    ignored,
                    context,
                    permutation,
                    DS_PARENT[lookup],
                  )
                : null));
        if (provided === null) {
          // Emotion's development build throws on `content: revert` (its
          // value validator accepts only normal|none|initial|inherit|unset
          // or a quoted/functional value); `content: none` gives the same
          // "no generated box" result as the user-agent default for a real
          // `::before`/`::after`, without hitting that check.
          decls[muiPropertyKey(property)] =
            property === 'content' ? 'none' : 'revert';
        } else if (provided.specificity < context.specificity) {
          decls[muiPropertyKey(property)] = provided.value;
        }
      }
      const keys = Object.keys(decls).sort(codeUnitCompare);
      if (keys.length === 0) {
        continue;
      }
      const sorted = Object.fromEntries(keys.map((k) => [k, decls[k]]));
      const style =
        rule.media === null
          ? { [rule.selector]: sorted }
          : { [`@media ${rule.media}`]: { [rule.selector]: sorted } };
      out.push({ props, style });
    }
  }
  return diag.errors.length > before ? null : out;
}
