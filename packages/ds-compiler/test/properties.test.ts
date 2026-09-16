import { describe, expect, it } from 'vitest';
import {
  BASELINE_PROPERTIES,
  FORBIDDEN_SHORTHANDS,
  PROPERTY_TABLE,
  expandShorthand,
  parseLiteralForProperty,
  splitTopLevel,
} from '../src/components/properties.js';

describe('PROPERTY_TABLE', () => {
  it('marks design-value properties as token-required and layout properties as keyword-only', () => {
    expect(PROPERTY_TABLE['color'].tokenRequired).toBe(true);
    expect(PROPERTY_TABLE['color'].categories).toEqual(['color']);
    expect(PROPERTY_TABLE['padding-top'].categories).toEqual(['space']);
    expect(PROPERTY_TABLE['border-top-left-radius'].categories).toEqual([
      'radius',
    ]);
    expect(PROPERTY_TABLE['display'].tokenRequired).toBe(false);
    expect(PROPERTY_TABLE['display'].literals).toContain('inline-flex');
    expect(PROPERTY_TABLE['width'].literalKinds).toContain('dimension');
    expect(PROPERTY_TABLE['border']).toBeUndefined();
    expect(PROPERTY_TABLE['colr']).toBeUndefined();
  });

  it('has no overlap between the table and forbidden shorthands', () => {
    for (const p of FORBIDDEN_SHORTHANDS) {
      expect(PROPERTY_TABLE[p]).toBeUndefined();
    }
  });

  it('baseline properties are all in the table', () => {
    for (const p of BASELINE_PROPERTIES) {
      expect(PROPERTY_TABLE[p]).toBeDefined();
    }
  });
});

describe('expandShorthand', () => {
  it('returns null for non-shorthands', () => {
    expect(expandShorthand('color', 'red')).toBeNull();
  });
  it('expands padding and margin with 1 to 4 values', () => {
    expect(expandShorthand('padding', 'var(--fx-space-2)')).toEqual({
      ok: true,
      declarations: {
        'padding-top': 'var(--fx-space-2)',
        'padding-right': 'var(--fx-space-2)',
        'padding-bottom': 'var(--fx-space-2)',
        'padding-left': 'var(--fx-space-2)',
      },
    });
    expect(expandShorthand('margin', '0 auto')).toEqual({
      ok: true,
      declarations: {
        'margin-top': '0',
        'margin-right': 'auto',
        'margin-bottom': '0',
        'margin-left': 'auto',
      },
    });
    expect(expandShorthand('padding', 'a b c')).toEqual({
      ok: true,
      declarations: {
        'padding-top': 'a',
        'padding-right': 'b',
        'padding-bottom': 'c',
        'padding-left': 'b',
      },
    });
    expect(expandShorthand('padding', 'a b c d')).toEqual({
      ok: true,
      declarations: {
        'padding-top': 'a',
        'padding-right': 'b',
        'padding-bottom': 'c',
        'padding-left': 'd',
      },
    });
  });
  it('expands border-radius corners, border sides, and gap', () => {
    expect(
      expandShorthand('border-radius', 'var(--fx-radius-md)'),
    ).toMatchObject({
      ok: true,
      declarations: {
        'border-top-left-radius': 'var(--fx-radius-md)',
        'border-bottom-left-radius': 'var(--fx-radius-md)',
      },
    });
    expect(expandShorthand('border-style', 'solid')).toMatchObject({
      ok: true,
      declarations: {
        'border-top-style': 'solid',
        'border-left-style': 'solid',
      },
    });
    expect(expandShorthand('gap', 'a b')).toEqual({
      ok: true,
      declarations: { 'row-gap': 'a', 'column-gap': 'b' },
    });
    expect(expandShorthand('gap', 'a')).toEqual({
      ok: true,
      declarations: { 'row-gap': 'a', 'column-gap': 'a' },
    });
  });
  it('rejects wrong value counts', () => {
    expect(expandShorthand('padding', 'a b c d e')).toEqual({
      ok: false,
      reason: 'expected 1 to 4 values, got 5',
    });
    expect(expandShorthand('gap', 'a b c')).toEqual({
      ok: false,
      reason: 'expected 1 to 2 values, got 3',
    });
  });
  it('rejects commas and slashes inside a shorthand value', () => {
    expect(expandShorthand('border-radius', '4px / 8px')).toEqual({
      ok: false,
      reason: '"," and "/" are not allowed in this shorthand',
    });
  });
});

describe('splitTopLevel', () => {
  it('keeps function calls intact and splits on top-level whitespace', () => {
    expect(splitTopLevel('var( --x ) 8px')).toEqual(['var( --x )', '8px']);
  });
  it('returns null when a top-level comma or slash divider is present', () => {
    expect(splitTopLevel('a, b')).toBeNull();
  });
});

describe('parseLiteralForProperty', () => {
  it('accepts listed keywords', () => {
    expect(parseLiteralForProperty('display', 'flex')).toEqual({
      kind: 'literal',
      type: 'keyword',
      value: 'flex',
    });
    expect(parseLiteralForProperty('display', 'flexbox')).toBeNull();
  });
  it('accepts dimension and number literals where allowed', () => {
    expect(parseLiteralForProperty('width', '100%')).toEqual({
      kind: 'literal',
      type: 'dimension',
      value: { value: 100, unit: '%' },
    });
    expect(parseLiteralForProperty('width', 'auto')).toEqual({
      kind: 'literal',
      type: 'keyword',
      value: 'auto',
    });
    expect(parseLiteralForProperty('flex-grow', '1')).toEqual({
      kind: 'literal',
      type: 'number',
      value: 1,
    });
    expect(parseLiteralForProperty('opacity', '0.5')).toEqual({
      kind: 'literal',
      type: 'number',
      value: 0.5,
    });
  });
  it('accepts identifier lists for transition-property', () => {
    expect(
      parseLiteralForProperty(
        'transition-property',
        'color,  background-color',
      ),
    ).toEqual({
      kind: 'literal',
      type: 'string',
      value: 'color, background-color',
    });
  });
  it('rejects literals for token-required properties except the listed escape hatches', () => {
    expect(parseLiteralForProperty('color', '#fff')).toBeNull();
    expect(parseLiteralForProperty('color', 'transparent')).toEqual({
      kind: 'literal',
      type: 'keyword',
      value: 'transparent',
    });
    expect(parseLiteralForProperty('padding-top', '8px')).toBeNull();
    expect(parseLiteralForProperty('padding-top', '0')).toEqual({
      kind: 'literal',
      type: 'keyword',
      value: '0',
    });
  });
  it('matches keywords case-insensitively but emits the canonical spelling', () => {
    expect(parseLiteralForProperty('color', 'currentcolor')).toEqual({
      kind: 'literal',
      type: 'keyword',
      value: 'currentColor',
    });
    expect(parseLiteralForProperty('display', 'FLEX')).toEqual({
      kind: 'literal',
      type: 'keyword',
      value: 'flex',
    });
  });
});
