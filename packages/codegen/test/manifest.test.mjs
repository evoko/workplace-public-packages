import { describe, expect, it } from 'vitest';
import { canonical } from '../src/emit/manifest.mjs';

describe('canonical', () => {
  it('reduces every colour spelling to the same value', () => {
    expect(canonical.color('#f5f5f5')).toBe('rgba(245, 245, 245, 1)');
    expect(canonical.color('rgba(0, 0, 0, 0.05)')).toBe('rgba(0, 0, 0, 0.05)');
    expect(canonical.color('0xFFF5F5F5')).toBe('rgba(245, 245, 245, 1)');
    expect(canonical.color('#F5F5F5')).toBe('rgba(245, 245, 245, 1)');
  });

  it('reduces dimensions to a number of pixels', () => {
    expect(canonical.dimension('16px')).toBe(16);
    expect(canonical.dimension(16)).toBe(16);
    expect(canonical.dimension('16.0')).toBe(16);
  });

  it('reduces durations to milliseconds', () => {
    expect(canonical.duration('100ms')).toBe(100);
    expect(canonical.duration(100)).toBe(100);
  });

  it('passes numbers, families, weights and beziers through', () => {
    expect(canonical.number(12)).toBe(12);
    expect(canonical.fontFamily('Open Sans')).toBe('Open Sans');
    expect(canonical.fontWeight(600)).toBe(600);
    expect(canonical.cubicBezier([0.42, 0, 1, 1])).toEqual([0.42, 0, 1, 1]);
  });

  it('parses the easing literals each target emits, so the round trip is real', () => {
    expect(canonical.cubicBezier('cubic-bezier(0.42, 0, 1, 1)')).toEqual([
      0.42, 0, 1, 1,
    ]);
    expect(canonical.cubicBezier('Cubic(0.42, 0, 0.58, 1)')).toEqual([
      0.42, 0, 0.58, 1,
    ]);
    expect(() => canonical.cubicBezier('ease-both')).toThrow(
      /cannot parse cubic bezier/,
    );
  });

  it('normalises composite shadows by structure, not by target syntax', () => {
    const layers = [
      {
        color: '#00000010',
        offsetX: '0px',
        offsetY: '1px',
        blur: '1px',
        spread: '0px',
      },
    ];
    expect(canonical.shadow(layers)).toBe(
      canonical.shadow(structuredClone(layers)),
    );
    expect(canonical.shadow(layers)).toContain('rgba(0, 0, 0, 0.063)');
  });

  it('rejects a colour it cannot parse rather than guessing', () => {
    expect(() => canonical.color('ease-both')).toThrow(/cannot parse colour/);
  });
});
