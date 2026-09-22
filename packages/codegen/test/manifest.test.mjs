import { describe, expect, it } from 'vitest';
import { canonical, letterSpacingEm } from '../src/emit/manifest.mjs';

describe('canonical', () => {
  it('reduces every colour spelling to the same value', () => {
    expect(canonical.color('#f5f5f5')).toBe('rgba(245, 245, 245, 1)');
    expect(canonical.color('0xFFF5F5F5')).toBe('rgba(245, 245, 245, 1)');
    expect(canonical.color('Color(0xFFF5F5F5)')).toBe('rgba(245, 245, 245, 1)');
    expect(canonical.color('#F5F5F5')).toBe('rgba(245, 245, 245, 1)');
  });

  it('quantizes alpha to the 8 bits Dart can carry, so the targets can agree', () => {
    // Color(0xAARRGGBB) has one byte for alpha, so 0.05 is stored as 13/255. Comparing the
    // CSS float against the Dart byte unquantized would report every alpha as a mismatch.
    expect(canonical.color('rgba(0, 0, 0, 0.05)')).toBe('rgba(0, 0, 0, 0.051)');
    expect(canonical.color('Color(0x0D000000)')).toBe('rgba(0, 0, 0, 0.051)');
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

describe('letterSpacingEm', () => {
  it('reads all three unit systems as the same quantity', () => {
    // Figma says -3% of the font size, CSS wants a length, Flutter wants logical pixels.
    expect(letterSpacingEm('-3%', 56)).toBe(-0.03);
    expect(letterSpacingEm('-1.68', 56)).toBe(-0.03);
    expect(letterSpacingEm('-0.03em', 56)).toBe(-0.03);
    expect(letterSpacingEm('-0.32px', 16)).toBe(-0.02);
  });

  it('lets a typography composite compare across targets', () => {
    const figma = {
      fontFamily: 'Inter',
      fontWeight: 500,
      fontSize: '56px',
      lineHeight: '72px',
      letterSpacing: '-3%',
    };
    const css = { ...figma, letterSpacing: '-0.03em' };
    const flutter = { ...figma, letterSpacing: '-1.68' };
    expect(canonical.typography(css)).toBe(canonical.typography(figma));
    expect(canonical.typography(flutter)).toBe(canonical.typography(figma));
  });

  it('refuses a value it cannot read', () => {
    expect(() => letterSpacingEm('normal', 16)).toThrow(
      /cannot parse letter spacing/,
    );
  });
});
