import { FREEZE_MARK } from './styles';

export interface Difference {
  component: string;
  row: string;
  mode: string;
  target: string;
  element: string;
  property: string;
  expected: string;
  actual: string;
}

/**
 * Sub-pixel layout rounding is the only difference one browser legitimately
 * produces between two cells rendering the same design, so the epsilon
 * applies to `px` lengths and to nothing else. Seconds, unitless numbers
 * (opacity, line-height, z-index, font-weight), percentages and colour
 * channels are compared exactly: a `150ms` token rendered as `250ms`, or an
 * opacity of `0.4` rendered as `0.85`, is a real difference however small the
 * number looks.
 */
const TOLERANCE = 0.5;
const TOLERANT_UNIT = 'px';

interface NumberToken {
  value: number;
  /** The unit written immediately after the number, `''` when unitless. */
  unit: string;
}

type Token = string | NumberToken;

const NUMBER = /-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?([a-z%]*)/gi;

function tokens(value: string): Token[] {
  const out: Token[] = [];
  let last = 0;
  for (const m of value.matchAll(NUMBER)) {
    const index = m.index ?? 0;
    if (index > last) {
      out.push(value.slice(last, index));
    }
    const unit = m[1] ?? '';
    out.push({
      value: Number(m[0].slice(0, m[0].length - unit.length)),
      unit: unit.toLowerCase(),
    });
    last = index + m[0].length;
  }
  if (last < value.length) {
    out.push(value.slice(last));
  }
  return out;
}

function sameToken(a: Token, b: Token): boolean {
  if (typeof a === 'string' || typeof b === 'string') {
    return a === b;
  }
  if (a.unit !== b.unit) {
    return false;
  }
  return a.unit === TOLERANT_UNIT
    ? Math.abs(a.value - b.value) <= TOLERANCE
    : a.value === b.value;
}

/**
 * `px` lengths within TOLERANCE of each other, every other number and every
 * literal exact; token shapes must match.
 */
export function compareValues(expected: string, actual: string): boolean {
  if (expected === actual) {
    return true;
  }
  const a = tokens(expected);
  const b = tokens(actual);
  return a.length === b.length && a.every((t, i) => sameToken(t, b[i]));
}

/**
 * The longhands `FREEZE_CSS` overrides. Read with the freeze sheet in place
 * they would agree between every target by construction, hiding exactly the
 * transition differences the design system's `duration` and `easing` tokens
 * exist to pin down.
 */
const FROZEN = new Set([
  'transition-behavior',
  'transition-delay',
  'transition-duration',
  'transition-property',
  'transition-timing-function',
]);

function freezeSheetOf(element: Element): HTMLStyleElement | null {
  const root = element.getRootNode();
  return root instanceof ShadowRoot
    ? root.querySelector<HTMLStyleElement>(`style[${FREEZE_MARK}]`)
    : null;
}

/**
 * The listed properties of an element as computed values. The frozen
 * longhands are re-read with the cell's freeze stylesheet switched off and
 * on again within this call: `getComputedStyle` forces the recalculation, and
 * nothing animatable changes in between, so no transition can start.
 */
export function readComputed(
  element: Element,
  properties: readonly string[],
): Record<string, string> {
  const style = getComputedStyle(element);
  const out = Object.fromEntries(
    properties.map((p) => [p, style.getPropertyValue(p)]),
  );
  const frozen = properties.filter((p) => FROZEN.has(p));
  const sheet = frozen.length > 0 ? freezeSheetOf(element) : null;
  if (!sheet) {
    return out;
  }
  sheet.disabled = true;
  try {
    const live = getComputedStyle(element);
    for (const p of frozen) {
      out[p] = live.getPropertyValue(p);
    }
  } finally {
    sheet.disabled = false;
  }
  return out;
}

export interface PropertyDifference {
  property: string;
  expected: string;
  actual: string;
}

export function diffComputed(
  expected: Record<string, string>,
  actual: Record<string, string>,
  properties: readonly string[],
): PropertyDifference[] {
  return properties
    .filter((p) => !compareValues(expected[p] ?? '', actual[p] ?? ''))
    .map((p) => ({
      property: p,
      expected: expected[p] ?? '',
      actual: actual[p] ?? '',
    }));
}

function sortKey(d: Difference): string {
  return [d.component, d.row, d.mode, d.target, d.element, d.property].join(
    '|',
  );
}

/** How many difference lines a report lists before it summarises the rest. */
export const MAX_LINES = 200;

/** One line per difference, sorted, headed by the total count and capped. */
export function formatDifferences(diffs: readonly Difference[]): string {
  const lines = [...diffs]
    .sort((x, y) =>
      sortKey(x) < sortKey(y) ? -1 : sortKey(x) > sortKey(y) ? 1 : 0,
    )
    .map(
      (d) =>
        `${d.component} | ${d.row} | ${d.mode} | ${d.target} | ${d.element} | ${d.property}: css ${d.expected} vs ${d.target} ${d.actual}`,
    );
  const n = diffs.length;
  const shown = lines.slice(0, MAX_LINES);
  return [
    `${n} rendered difference${n === 1 ? '' : 's'} against the css cell:`,
    ...shown,
    ...(n > shown.length ? [`… and ${n - shown.length} more`] : []),
  ].join('\n');
}
