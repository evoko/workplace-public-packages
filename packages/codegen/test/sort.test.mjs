import { describe, expect, it } from 'vitest';
import { byCodeUnit } from '../src/util/sort.mjs';

describe('byCodeUnit', () => {
  it('sorts punctuation before letters, so a token path orders under its own prefix', () => {
    // The ordering that matters for generated output: a dot is code unit 46 and sorts ahead of
    // any letter, so color.border.inverse stays next to its children instead of drifting.
    expect(
      ['colorBorder', 'color.border.inverse', 'color.border'].sort(byCodeUnit),
    ).toEqual(['color.border', 'color.border.inverse', 'colorBorder']);
  });

  it('sorts capitals before lower case, which is where a locale comparator disagrees', () => {
    expect(
      ['SolarType', 'SolarColors', 'Solarcolors'].sort(byCodeUnit),
    ).toEqual(['SolarColors', 'SolarType', 'Solarcolors']);
  });

  it('reports equality as zero so sorts stay stable', () => {
    expect(byCodeUnit('a', 'a')).toBe(0);
  });
});
