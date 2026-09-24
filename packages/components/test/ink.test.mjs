import { describe, expect, it } from 'vitest';
import { inkOn, parseColour } from '../src/internal/ink.ts';

const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = ([r, g, b]) =>
  0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const contrast = (a, b) => {
  const [x, y] = [luminance(parseColour(a)), luminance(parseColour(b))];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

// Figma's Avatar samples, a light, medium and dark of each hue (Primitives).
const SAMPLES = [
  '#f5f5f5',
  '#878787',
  '#646464',
  '#222222',
  '#ffe4df',
  '#e0032d',
  '#410001',
  '#fffbd5',
  '#c39900',
  '#392c01',
  '#ecffe9',
  '#009600',
  '#002400',
  '#f0ffff',
  '#08b8c9',
  '#033238',
  '#e9f2ff',
  '#2569fd',
  '#03144b',
  '#f4edff',
  '#7b3aff',
  '#24004b',
  '#fff1fa',
  '#e136bc',
  '#4a003d',
];

describe('the ink on a caller’s colour (Avatar’s initials)', () => {
  it('reads at WCAG AA on every colour Figma samples', () => {
    for (const colour of SAMPLES)
      expect(contrast(colour, inkOn(colour)), colour).toBeGreaterThanOrEqual(
        4.5,
      );
  });

  it('is dark on a light colour and light on a dark one, in its hue', () => {
    expect(inkOn('#ffe4df')).toBe('rgb(123 6 0)');
    expect(inkOn('#410001')).toBe('rgb(255 224 219)');
    // A grey's ink is a grey.
    expect(inkOn('#f5f5f5')).toBe('rgb(64 64 64)');
  });

  it('moves toward black or white only as far as AA needs, from the side that reads better', () => {
    // Blue 500: light, as Figma draws its Medium, pushed just past 4.5:1.
    expect(inkOn('#2569fd')).toBe('rgb(250 252 255)');
    // Yellow 600 and pink 500: no light ink reads at AA, so a dark one does.
    expect(inkOn('#c39900')).toBe('rgb(69 52 0)');
    expect(inkOn('#e136bc')).toBe('rgb(57 0 45)');
  });

  it('reads the colour forms a caller writes, and no other', () => {
    expect(inkOn('#FFE4DF')).toBe(inkOn('rgb(255, 228, 223)'));
    expect(inkOn('#fe9')).not.toBeNull();
    expect(inkOn('hsl(0 100% 94%)')).not.toBeNull();
    expect(inkOn('var(--brand)')).toBeNull();
  });
});
