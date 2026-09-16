import { describe, expect, it } from 'vitest';
import {
  CATEGORY_TYPES,
  TOKEN_CATEGORIES,
  categoryOfTokenId,
  isTokenCategory,
  parseTokenName,
  tokenIdToCssName,
} from '../src/tokens/categories.js';

describe('categories', () => {
  it('has 15 fixed categories, each with at least one value type', () => {
    expect(TOKEN_CATEGORIES).toHaveLength(15);
    for (const c of TOKEN_CATEGORIES) {
      expect(CATEGORY_TYPES[c].length).toBeGreaterThan(0);
    }
    expect(isTokenCategory('color')).toBe(true);
    expect(isTokenCategory('colour')).toBe(false);
  });
});

describe('parseTokenName', () => {
  it('parses category and path for a single-word category', () => {
    expect(parseTokenName('--fx-color-primary-default', 'fx')).toEqual({
      category: 'color',
      path: ['primary', 'default'],
      id: 'color.primary.default',
    });
  });

  it('parses a hyphenated category before splitting the path', () => {
    expect(parseTokenName('--fx-font-family-heading', 'fx')).toEqual({
      category: 'font-family',
      path: ['heading'],
      id: 'font-family.heading',
    });
  });

  it('accepts numeric path segments', () => {
    expect(parseTokenName('--fx-space-4', 'fx')?.id).toBe('space.4');
  });

  it('rejects the wrong prefix, a missing path, an unknown category, and bad casing', () => {
    expect(parseTokenName('--other-color-primary', 'fx')).toBeNull();
    expect(parseTokenName('--fx-color', 'fx')).toBeNull();
    expect(parseTokenName('--fx-colour-primary', 'fx')).toBeNull();
    expect(parseTokenName('--fx-color-Primary', 'fx')).toBeNull();
    expect(parseTokenName('--fx-color-primary--default', 'fx')).toBeNull();
    expect(parseTokenName('color-primary', 'fx')).toBeNull();
  });
});

describe('tokenIdToCssName', () => {
  it('round-trips with parseTokenName', () => {
    const name = tokenIdToCssName('font-size.body.1', 'fx');
    expect(name).toBe('--fx-font-size-body-1');
    expect(parseTokenName(name, 'fx')?.id).toBe('font-size.body.1');
  });
});

describe('categoryOfTokenId', () => {
  it('returns the leading category or null when it is not a known category', () => {
    expect(categoryOfTokenId('font-size.body.1')).toBe('font-size');
    expect(categoryOfTokenId('nope.x')).toBeNull();
  });
});
