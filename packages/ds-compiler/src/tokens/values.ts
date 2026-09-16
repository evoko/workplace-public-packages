import { formatHex8, parse as parseCuloriColor } from 'culori';
import valueParser from 'postcss-value-parser';
import type { TokenId } from '../ir/types.js';
import { categoryOfTokenId, parseTokenName } from './categories.js';

export type TokenType =
  | 'color'
  | 'dimension'
  | 'fontFamily'
  | 'fontWeight'
  | 'number'
  | 'duration'
  | 'cubicBezier'
  | 'shadow';

export interface ColorValue {
  /** Always "#rrggbbaa", lowercase. */
  hex: string;
}
export type DimensionUnit = 'px' | 'rem' | 'em' | '%';
export interface DimensionValue {
  value: number;
  unit: DimensionUnit;
}
export interface FontFamilyValue {
  families: string[];
}
export interface FontWeightValue {
  weight: number;
}
export interface NumberValue {
  value: number;
}
export interface DurationValue {
  ms: number;
}
export interface CubicBezierValue {
  points: [number, number, number, number];
}
export interface ShadowLayer {
  inset: boolean;
  offsetX: DimensionValue;
  offsetY: DimensionValue;
  blur: DimensionValue;
  spread: DimensionValue;
  color: ColorValue | { ref: TokenId };
}
export interface ShadowValue {
  layers: ShadowLayer[];
}

export type TokenValue =
  | ColorValue
  | DimensionValue
  | FontFamilyValue
  | FontWeightValue
  | NumberValue
  | DurationValue
  | CubicBezierValue
  | ShadowValue;

const ZERO: DimensionValue = { value: 0, unit: 'px' };

export function normalizeColor(raw: string): string | null {
  const text = raw.trim();
  if (text === '') {
    return null;
  }
  const parsed = parseCuloriColor(text);
  if (!parsed) {
    return null;
  }
  return formatHex8(parsed).toLowerCase();
}

const NUMBER_SOURCE = '-?(?:\\d+\\.?\\d*|\\.\\d+)';
const DIMENSION = new RegExp(`^(${NUMBER_SOURCE})(px|rem|em|%)$`);
const ZERO_TEXT = /^-?0+(\.0+)?$/;

export function parseDimension(raw: string): DimensionValue | null {
  const text = raw.trim();
  if (ZERO_TEXT.test(text)) {
    return { ...ZERO };
  }
  const m = DIMENSION.exec(text);
  if (!m) {
    return null;
  }
  return { value: Number(m[1]), unit: m[2] as DimensionUnit };
}

export function parseFontFamily(raw: string): FontFamilyValue | null {
  const families: string[] = [];
  let current: string[] = [];
  const flush = (): void => {
    const name = current.join(' ').trim();
    if (name !== '') {
      families.push(name);
    }
    current = [];
  };
  for (const node of valueParser(raw).nodes) {
    if (node.type === 'div' && node.value === ',') {
      flush();
    } else if (node.type === 'string' || node.type === 'word') {
      current.push(node.value);
    }
  }
  flush();
  return families.length > 0 ? { families } : null;
}

const FONT_WEIGHT_KEYWORDS: Record<string, number> = { normal: 400, bold: 700 };

export function parseFontWeight(raw: string): FontWeightValue | null {
  const text = raw.trim();
  if (Object.hasOwn(FONT_WEIGHT_KEYWORDS, text)) {
    return { weight: FONT_WEIGHT_KEYWORDS[text] };
  }
  if (!/^\d+$/.test(text)) {
    return null;
  }
  const weight = Number(text);
  return weight >= 1 && weight <= 1000 ? { weight } : null;
}

const NUMBER = new RegExp(`^${NUMBER_SOURCE}$`);

export function parseNumber(raw: string): NumberValue | null {
  const text = raw.trim();
  return NUMBER.test(text) ? { value: Number(text) } : null;
}

const DURATION = new RegExp(`^(${NUMBER_SOURCE})(ms|s)$`);

export function parseDuration(raw: string): DurationValue | null {
  const m = DURATION.exec(raw.trim());
  if (!m) {
    return null;
  }
  const n = Number(m[1]);
  const ms = m[2] === 's' ? n * 1000 : n;
  return { ms: Math.round(ms * 1000) / 1000 };
}

const EASING_KEYWORDS: Record<string, [number, number, number, number]> = {
  linear: [0, 0, 1, 1],
  ease: [0.25, 0.1, 0.25, 1],
  'ease-in': [0.42, 0, 1, 1],
  'ease-out': [0, 0, 0.58, 1],
  'ease-in-out': [0.42, 0, 0.58, 1],
};
const CUBIC = new RegExp(
  `^cubic-bezier\\(\\s*(${NUMBER_SOURCE})\\s*,\\s*(${NUMBER_SOURCE})\\s*,\\s*(${NUMBER_SOURCE})\\s*,\\s*(${NUMBER_SOURCE})\\s*\\)$`,
);

export function parseCubicBezier(raw: string): CubicBezierValue | null {
  const text = raw.trim();
  if (Object.hasOwn(EASING_KEYWORDS, text)) {
    const [a, b, c, d] = EASING_KEYWORDS[text];
    return { points: [a, b, c, d] };
  }
  const m = CUBIC.exec(text);
  if (!m) {
    return null;
  }
  const points: [number, number, number, number] = [
    Number(m[1]),
    Number(m[2]),
    Number(m[3]),
    Number(m[4]),
  ];
  return points.every((p) => Number.isFinite(p)) ? { points } : null;
}

export type VarRefResult =
  | { ok: true; id: TokenId; name: string }
  | { ok: false; reason: string };

const VAR_ONLY = /^var\(\s*(--[a-zA-Z0-9-]+)\s*\)$/;

/**
 * Returns null when the value is not a var() expression at all,
 * ok:true for a clean reference to a token of this prefix,
 * ok:false when var() is present but not in an allowed form.
 */
export function parseVarRef(raw: string, prefix: string): VarRefResult | null {
  const text = raw.trim();
  if (!/var\(/i.test(text)) {
    return null;
  }
  const m = VAR_ONLY.exec(text);
  if (!m) {
    return {
      ok: false,
      reason:
        'var() must be the whole value with no fallback and no surrounding expression',
    };
  }
  const name = m[1];
  const parsed = parseTokenName(name, prefix);
  if (!parsed) {
    return {
      ok: false,
      reason: `"${name}" is not a token name for prefix "${prefix}" (expected --${prefix}-<category>-<path>)`,
    };
  }
  return { ok: true, id: parsed.id, name };
}

export function parseShadow(raw: string, prefix: string): ShadowValue | null {
  const text = raw.trim();
  if (text === 'none') {
    return { layers: [] };
  }
  const layersNodes: valueParser.Node[][] = [[]];
  for (const node of valueParser(text).nodes) {
    if (node.type === 'div' && node.value === ',') {
      layersNodes.push([]);
    } else if (node.type !== 'space' && node.type !== 'comment') {
      layersNodes[layersNodes.length - 1].push(node);
    }
  }
  const layers: ShadowLayer[] = [];
  for (const nodes of layersNodes) {
    let inset = false;
    const dims: DimensionValue[] = [];
    let color: ShadowLayer['color'] | null = null;
    for (const node of nodes) {
      if (node.type === 'word' && node.value === 'inset') {
        inset = true;
        continue;
      }
      if (node.type === 'function' && node.value === 'var') {
        const ref = parseVarRef(valueParser.stringify(node), prefix);
        if (!ref || !ref.ok || color || categoryOfTokenId(ref.id) !== 'color') {
          return null;
        }
        color = { ref: ref.id };
        continue;
      }
      if (node.type === 'word') {
        const dim = parseDimension(node.value);
        if (dim) {
          dims.push(dim);
          continue;
        }
      }
      const hex = normalizeColor(valueParser.stringify(node));
      if (hex && !color) {
        color = { hex };
        continue;
      }
      return null;
    }
    if (dims.length < 2 || dims.length > 4 || !color) {
      return null;
    }
    layers.push({
      inset,
      offsetX: dims[0],
      offsetY: dims[1],
      blur: dims[2] ?? { ...ZERO },
      spread: dims[3] ?? { ...ZERO },
      color,
    });
  }
  return { layers };
}

export function parseLiteral(
  raw: string,
  type: TokenType,
  prefix: string,
): TokenValue | null {
  switch (type) {
    case 'color': {
      const hex = normalizeColor(raw);
      return hex ? { hex } : null;
    }
    case 'dimension':
      return parseDimension(raw);
    case 'fontFamily':
      return parseFontFamily(raw);
    case 'fontWeight':
      return parseFontWeight(raw);
    case 'number':
      return parseNumber(raw);
    case 'duration':
      return parseDuration(raw);
    case 'cubicBezier':
      return parseCubicBezier(raw);
    case 'shadow':
      return parseShadow(raw, prefix);
  }
}

export interface TypedValue {
  type: TokenType;
  value: TokenValue;
}

export function parseLiteralForTypes(
  raw: string,
  types: readonly TokenType[],
  prefix: string,
): TypedValue | null {
  for (const type of types) {
    const value = parseLiteral(raw, type, prefix);
    if (value) {
      return { type, value };
    }
  }
  return null;
}
