import type { TokenId } from '../../ir/types.js';
import type {
  DimensionValue,
  FontFamilyValue,
  ShadowValue,
  TokenType,
  TokenValue,
} from '../../tokens/values.js';

/** `#rrggbb` when fully opaque, otherwise `#rrggbbaa`. Input is always `#rrggbbaa`. */
export function renderColor(hex: string): string {
  return hex.length === 9 && hex.endsWith('ff') ? hex.slice(0, 7) : hex;
}

/** `String(n)`, except for values that would render in exponential notation. */
export function formatNumber(n: number): string {
  const s = String(n);
  if (s.includes('e') || s.includes('E')) {
    return n.toFixed(10).replace(/\.?0+$/, '');
  }
  return s;
}

export function renderDimension(d: DimensionValue): string {
  return `${formatNumber(d.value)}${d.unit}`;
}

const PLAIN_FAMILY = /^[a-zA-Z][a-zA-Z0-9-]*$/;

/** Escapes a literal backslash so it survives being re-tokenized as a CSS string. */
function escapeBackslashes(name: string): string {
  return name.replace(/\\/g, '\\\\');
}

function renderFamily(name: string): string {
  if (PLAIN_FAMILY.test(name)) {
    return name;
  }
  const hasSingle = name.includes("'");
  const hasDouble = name.includes('"');
  if (!hasSingle) {
    return `'${escapeBackslashes(name)}'`;
  }
  if (!hasDouble) {
    return `"${escapeBackslashes(name)}"`;
  }
  return `'${escapeBackslashes(name).replace(/'/g, "\\'")}'`;
}

export function renderFontFamily(v: FontFamilyValue): string {
  return v.families.map(renderFamily).join(', ');
}

export function renderShadow(
  v: ShadowValue,
  refName: (id: TokenId) => string,
): string {
  if (v.layers.length === 0) {
    return 'none';
  }
  return v.layers
    .map((l) => {
      const color =
        'hex' in l.color
          ? renderColor(l.color.hex)
          : `var(${refName(l.color.ref)})`;
      const parts = [
        renderDimension(l.offsetX),
        renderDimension(l.offsetY),
        renderDimension(l.blur),
        renderDimension(l.spread),
        color,
      ];
      return (l.inset ? ['inset', ...parts] : parts).join(' ');
    })
    .join(', ');
}

/**
 * CSS text for a resolved token value. `refName` maps a token id to the variable
 * name a shadow layer's color reference should use.
 */
export function renderTokenValue(
  value: TokenValue,
  type: TokenType,
  refName: (id: TokenId) => string,
): string {
  switch (type) {
    case 'color':
      return renderColor((value as { hex: string }).hex);
    case 'dimension':
      return renderDimension(value as DimensionValue);
    case 'fontFamily':
      return renderFontFamily(value as FontFamilyValue);
    case 'fontWeight':
      return formatNumber((value as { weight: number }).weight);
    case 'number':
      return formatNumber((value as { value: number }).value);
    case 'duration':
      return `${(value as { ms: number }).ms}ms`;
    case 'cubicBezier': {
      const [a, b, c, d] = (
        value as { points: [number, number, number, number] }
      ).points;
      return `cubic-bezier(${formatNumber(a)}, ${formatNumber(b)}, ${formatNumber(c)}, ${formatNumber(d)})`;
    }
    case 'shadow':
      return renderShadow(value as ShadowValue, refName);
  }
}
