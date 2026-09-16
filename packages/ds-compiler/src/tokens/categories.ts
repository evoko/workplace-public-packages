import type { TokenId } from '../ir/types.js';
import type { TokenType } from './values.js';

export const TOKEN_CATEGORIES = [
  'color',
  'space',
  'radius',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'shadow',
  'border-width',
  'duration',
  'easing',
  'opacity',
  'z-index',
  'size',
] as const;

export type TokenCategory = (typeof TOKEN_CATEGORIES)[number];

/** Value types a category accepts, tried in order when parsing a literal. */
export const CATEGORY_TYPES: Record<TokenCategory, readonly TokenType[]> = {
  color: ['color'],
  space: ['dimension'],
  radius: ['dimension'],
  'font-family': ['fontFamily'],
  'font-size': ['dimension'],
  'font-weight': ['fontWeight'],
  'line-height': ['number', 'dimension'],
  'letter-spacing': ['dimension'],
  shadow: ['shadow'],
  'border-width': ['dimension'],
  duration: ['duration'],
  easing: ['cubicBezier'],
  opacity: ['number'],
  'z-index': ['number'],
  size: ['dimension'],
};

export function isTokenCategory(value: string): value is TokenCategory {
  return (TOKEN_CATEGORIES as readonly string[]).includes(value);
}

export interface ParsedTokenName {
  category: TokenCategory;
  path: string[];
  id: TokenId;
}

const PATH_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Longest category first so "font-family" wins over any shorter overlap.
const CATEGORIES_BY_LENGTH = [...TOKEN_CATEGORIES].sort(
  (a, b) => b.length - a.length,
);

/** Parses "--<prefix>-<category>-<path>" into its parts, or null when it does not match. */
export function parseTokenName(
  name: string,
  prefix: string,
): ParsedTokenName | null {
  const lead = `--${prefix}-`;
  if (!name.startsWith(lead)) {
    return null;
  }
  const rest = name.slice(lead.length);
  for (const category of CATEGORIES_BY_LENGTH) {
    if (rest.startsWith(`${category}-`)) {
      const pathText = rest.slice(category.length + 1);
      if (!PATH_PATTERN.test(pathText)) {
        return null;
      }
      const path = pathText.split('-');
      return { category, path, id: [category, ...path].join('.') };
    }
  }
  return null;
}

/** "color.primary.default" -> "--<prefix>-color-primary-default". */
export function tokenIdToCssName(id: TokenId, prefix: string): string {
  return `--${prefix}-${id.split('.').join('-')}`;
}

export function categoryOfTokenId(id: TokenId): TokenCategory | null {
  const first = id.split('.')[0];
  return isTokenCategory(first) ? first : null;
}
