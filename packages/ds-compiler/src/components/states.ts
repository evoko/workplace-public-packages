/** Pseudo-class name (without the colon) to state name. */
export const PSEUDO_STATES: Record<string, string> = {
  hover: 'hover',
  active: 'active',
  'focus-visible': 'focus-visible',
  disabled: 'disabled',
};

const ARIA_TRUE_STATES: Record<string, string> = {
  'aria-pressed': 'pressed',
  'aria-selected': 'selected',
  'aria-expanded': 'expanded',
  'aria-checked': 'checked',
};

/** Attribute selector to state name, or null when the attribute is not a state. */
export function stateForAttribute(
  attribute: string,
  value: string | undefined,
): string | null {
  if (attribute === 'disabled' && value === undefined) {
    return 'disabled';
  }
  if (attribute === 'aria-disabled' && value === 'true') {
    return 'disabled';
  }
  if (attribute in ARIA_TRUE_STATES && value === 'true') {
    return ARIA_TRUE_STATES[attribute];
  }
  if (attribute === 'data-state' && value !== undefined && value !== '') {
    return value;
  }
  return null;
}

/** Canonical cascade order. States not listed sort after these, alphabetically. */
export const STATE_ORDER = [
  'hover',
  'focus-visible',
  'active',
  'pressed',
  'selected',
  'expanded',
  'checked',
  'disabled',
] as const;

export function compareStates(a: string, b: string): number {
  const ia = STATE_ORDER.indexOf(a as (typeof STATE_ORDER)[number]);
  const ib = STATE_ORDER.indexOf(b as (typeof STATE_ORDER)[number]);
  if (ia !== -1 && ib !== -1) {
    return ia - ib;
  }
  if (ia !== -1) {
    return -1;
  }
  if (ib !== -1) {
    return 1;
  }
  return a < b ? -1 : a > b ? 1 : 0;
}

export function sortStates(states: readonly string[]): string[] {
  return [...new Set(states)].sort(compareStates);
}
