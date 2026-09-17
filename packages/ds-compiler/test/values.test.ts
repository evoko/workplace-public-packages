import { describe, expect, it } from 'vitest';
import {
  normalizeColor,
  parseCubicBezier,
  parseDimension,
  parseDuration,
  parseFontFamily,
  parseFontWeight,
  parseLiteral,
  parseLiteralForTypes,
  parseNumber,
  parseShadow,
  parseVarRef,
} from '../src/tokens/values.js';

describe('normalizeColor', () => {
  it('normalizes hex, rgb, and named colors to #rrggbbaa', () => {
    expect(normalizeColor('#fff')).toBe('#ffffffff');
    expect(normalizeColor('#1863D3')).toBe('#1863d3ff');
    expect(normalizeColor('rgb(0 0 0 / 50%)')).toBe('#00000080');
    expect(normalizeColor('rgba(255, 0, 0, 0.5)')).toBe('#ff000080');
    expect(normalizeColor('white')).toBe('#ffffffff');
  });
  it('returns null for non-colors', () => {
    expect(normalizeColor('notacolor')).toBeNull();
    expect(normalizeColor('12px')).toBeNull();
    expect(normalizeColor('')).toBeNull();
  });
});

describe('parseDimension', () => {
  it('parses px, rem, em, and %', () => {
    expect(parseDimension('12px')).toEqual({ value: 12, unit: 'px' });
    expect(parseDimension('0.875rem')).toEqual({ value: 0.875, unit: 'rem' });
    expect(parseDimension('-.5em')).toEqual({ value: -0.5, unit: 'em' });
    expect(parseDimension('100%')).toEqual({ value: 100, unit: '%' });
  });
  it('treats unitless zero as 0px and rejects other unitless numbers', () => {
    expect(parseDimension('0')).toEqual({ value: 0, unit: 'px' });
    expect(parseDimension('12')).toBeNull();
    expect(parseDimension('12pt')).toBeNull();
    expect(parseDimension('auto')).toBeNull();
  });
});

describe('parseFontFamily', () => {
  it('splits families and strips quotes', () => {
    expect(parseFontFamily("'Open Sans', Arial, sans-serif")).toEqual({
      families: ['Open Sans', 'Arial', 'sans-serif'],
    });
  });
  it('rejects empty input', () => {
    expect(parseFontFamily('')).toBeNull();
  });
  it('unescapes CSS string escapes inside a quoted family name', () => {
    expect(parseFontFamily("'Bob\\'s Font', serif")).toEqual({
      families: ["Bob's Font", 'serif'],
    });
  });
});

describe('parseFontWeight', () => {
  it('parses numbers and keywords', () => {
    expect(parseFontWeight('600')).toEqual({ weight: 600 });
    expect(parseFontWeight('normal')).toEqual({ weight: 400 });
    expect(parseFontWeight('bold')).toEqual({ weight: 700 });
  });
  it('rejects out-of-range and unknown values', () => {
    expect(parseFontWeight('0')).toBeNull();
    expect(parseFontWeight('1001')).toBeNull();
    expect(parseFontWeight('bolder')).toBeNull();
  });
});

describe('parseNumber / parseDuration / parseCubicBezier', () => {
  it('parses numbers', () => {
    expect(parseNumber('1.5')).toEqual({ value: 1.5 });
    expect(parseNumber('-2')).toEqual({ value: -2 });
    expect(parseNumber('1px')).toBeNull();
  });
  it('parses durations to ms', () => {
    expect(parseDuration('200ms')).toEqual({ ms: 200 });
    expect(parseDuration('0.3s')).toEqual({ ms: 300 });
    expect(parseDuration('200')).toBeNull();
  });
  it('parses easing keywords and cubic-bezier()', () => {
    expect(parseCubicBezier('ease-in-out')).toEqual({
      points: [0.42, 0, 0.58, 1],
    });
    expect(parseCubicBezier('cubic-bezier(0.4, 0, 0.2, 1)')).toEqual({
      points: [0.4, 0, 0.2, 1],
    });
    expect(parseCubicBezier('steps(4)')).toBeNull();
  });
  it('rejects malformed numeric literals in cubic-bezier()', () => {
    expect(parseCubicBezier('cubic-bezier(1.2.3, 0, 0, 1)')).toBeNull();
    expect(parseCubicBezier('cubic-bezier(., ., ., .)')).toBeNull();
  });
  it('rounds durations to microsecond precision', () => {
    expect(parseDuration('1.005s')).toEqual({ ms: 1005 });
  });
  it('does not treat Object.prototype members as matches, and does not throw', () => {
    expect(parseFontWeight('constructor')).toBeNull();
    expect(() => parseCubicBezier('toString')).not.toThrow();
    expect(parseCubicBezier('toString')).toBeNull();
  });
});

describe('parseShadow', () => {
  it('parses a single layer with a literal color', () => {
    expect(parseShadow('0 1px 2px rgba(0, 0, 0, 0.2)', 'fx')).toEqual({
      layers: [
        {
          inset: false,
          offsetX: { value: 0, unit: 'px' },
          offsetY: { value: 1, unit: 'px' },
          blur: { value: 2, unit: 'px' },
          spread: { value: 0, unit: 'px' },
          color: { hex: '#00000033' },
        },
      ],
    });
  });
  it('parses multiple layers, inset, and a var() color', () => {
    const v = parseShadow(
      'inset 0 0 0 1px var(--fx-color-border-default), 0 4px 8px 0 #0000001a',
      'fx',
    );
    expect(v?.layers).toHaveLength(2);
    expect(v?.layers[0].inset).toBe(true);
    expect(v?.layers[0].color).toEqual({ ref: 'color.border.default' });
    expect(v?.layers[1].color).toEqual({ hex: '#0000001a' });
  });
  it('parses none as zero layers and rejects malformed layers', () => {
    expect(parseShadow('none', 'fx')).toEqual({ layers: [] });
    expect(parseShadow('1px red', 'fx')).toBeNull();
    expect(parseShadow('0 0 0 0 0 red', 'fx')).toBeNull();
    expect(parseShadow('0 1px 2px', 'fx')).toBeNull();
  });
  it('rejects a var() color that does not reference a color token', () => {
    expect(parseShadow('0 0 2px var(--fx-space-1)', 'fx')).toBeNull();
  });
});

describe('parseVarRef', () => {
  it('returns null for non-var values', () => {
    expect(parseVarRef('#fff', 'fx')).toBeNull();
  });
  it('parses a valid reference', () => {
    expect(parseVarRef('var(--fx-color-primary-default)', 'fx')).toEqual({
      ok: true,
      id: 'color.primary.default',
      name: '--fx-color-primary-default',
    });
    expect(parseVarRef('var( --fx-space-2 )', 'fx')).toEqual({
      ok: true,
      id: 'space.2',
      name: '--fx-space-2',
    });
  });
  it('rejects fallbacks, wrong prefixes, and var() inside expressions', () => {
    expect(parseVarRef('var(--fx-space-2, 8px)', 'fx')).toMatchObject({
      ok: false,
    });
    expect(parseVarRef('var(--other-space-2)', 'fx')).toMatchObject({
      ok: false,
    });
    expect(parseVarRef('calc(var(--fx-space-2) * 2)', 'fx')).toMatchObject({
      ok: false,
    });
  });
  it('rejects uppercase VAR() with a reason instead of returning null', () => {
    expect(parseVarRef('VAR(--fx-space-2)', 'fx')).toMatchObject({
      ok: false,
    });
  });
});

describe('parseLiteral / parseLiteralForTypes', () => {
  it('dispatches on type', () => {
    expect(parseLiteral('#000', 'color', 'fx')).toEqual({ hex: '#000000ff' });
    expect(parseLiteral('8px', 'dimension', 'fx')).toEqual({
      value: 8,
      unit: 'px',
    });
    expect(parseLiteral('8px', 'color', 'fx')).toBeNull();
  });
  it('tries types in order and reports which matched', () => {
    expect(parseLiteralForTypes('1.5', ['number', 'dimension'], 'fx')).toEqual({
      type: 'number',
      value: { value: 1.5 },
    });
    expect(parseLiteralForTypes('24px', ['number', 'dimension'], 'fx')).toEqual(
      { type: 'dimension', value: { value: 24, unit: 'px' } },
    );
    expect(parseLiteralForTypes('x', ['number', 'dimension'], 'fx')).toBeNull();
  });
});
