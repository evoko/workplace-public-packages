import { describe, expect, it } from 'vitest';

import { cacheKey } from './cache-key';

describe('cacheKey', () => {
  it('yields only lowercase letters, as Emotion requires', () => {
    expect(cacheKey('mui|variant=filled size=md base')).toMatch(/^[a-z]+$/);
    expect(cacheKey('css|color.accent.200')).toMatch(/^[a-z]+$/);
  });

  it('keeps cells that differ only in a digit apart', () => {
    expect(cacheKey('css|color.accent.200')).not.toBe(
      cacheKey('css|color.accent.300'),
    );
    expect(cacheKey('css|border-width.1')).not.toBe(
      cacheKey('css|border-width.2'),
    );
  });

  it('keeps cells of different targets apart', () => {
    expect(cacheKey('css|base')).not.toBe(cacheKey('mui|base'));
  });
});
