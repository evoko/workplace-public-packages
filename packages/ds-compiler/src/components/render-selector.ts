import type { Rule } from '../ir/types.js';
import { ARIA_TRUE_STATES, PSEUDO_STATES } from './states.js';

/** Elements that `:disabled` and `[disabled]` can match. */
export const FORM_CONTROL_ELEMENTS: ReadonlySet<string> = new Set([
  'button',
  'input',
  'select',
  'textarea',
  'fieldset',
  'option',
  'optgroup',
]);

/** state name -> pseudo-class name (without the colon). */
const PSEUDO_BY_STATE: Record<string, string> = Object.fromEntries(
  Object.entries(PSEUDO_STATES).map(([pseudo, state]) => [state, pseudo]),
);
/** state name -> aria attribute name. */
const ARIA_ATTR_BY_STATE: Record<string, string> = Object.fromEntries(
  Object.entries(ARIA_TRUE_STATES).map(([attr, state]) => [state, attr]),
);

/**
 * Canonical selector fragment for a state. `disabled` depends on the root
 * element: form controls use `:disabled`; anything else uses
 * `[aria-disabled="true"]`, which is the only form that can match.
 */
export function stateSelector(state: string, rootElement: string): string {
  if (state === 'disabled') {
    return FORM_CONTROL_ELEMENTS.has(rootElement)
      ? ':disabled'
      : '[aria-disabled="true"]';
  }
  if (Object.hasOwn(PSEUDO_BY_STATE, state)) {
    return `:${PSEUDO_BY_STATE[state]}`;
  }
  if (Object.hasOwn(ARIA_ATTR_BY_STATE, state)) {
    return `[${ARIA_ATTR_BY_STATE[state]}="true"]`;
  }
  return `[data-state="${state}"]`;
}

export interface SelectorTarget {
  name: string;
  rootElement: string;
}

/**
 * Canonical selector for a rule: root class, axis attributes in alphabetical
 * axis order (independent of manifest order, so generation from the in-memory
 * IR and from design.ir.json agree), states in the rule's canonical order,
 * then the slot class after one descendant space.
 */
export function renderRuleSelector(
  prefix: string,
  target: SelectorTarget,
  rule: Pick<Rule, 'slot' | 'axes' | 'states'>,
): string {
  const root = `.${prefix}-${target.name}`;
  const axes = Object.keys(rule.axes)
    .sort()
    .map((axis) => `[data-${axis}="${rule.axes[axis]}"]`)
    .join('');
  const states = rule.states
    .map((state) => stateSelector(state, target.rootElement))
    .join('');
  const compound = `${root}${axes}${states}`;
  return rule.slot === 'root' ? compound : `${compound} ${root}__${rule.slot}`;
}
