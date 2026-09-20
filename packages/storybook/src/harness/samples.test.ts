import { TOKEN_CATEGORIES } from '@bwp-web/ds-compiler';
import { describe, expect, it } from 'vitest';

import { SAMPLES } from './samples';

describe('SAMPLES', () => {
  it('covers every token category the compiler knows, and nothing else', () => {
    expect(Object.keys(SAMPLES).sort()).toEqual([...TOKEN_CATEGORIES].sort());
  });

  it.each(TOKEN_CATEGORIES)(
    '%s consumes the variable it compares',
    (category) => {
      const sample = SAMPLES[category];
      const style = sample.style('--x');
      expect(style).toContain('var(--x)');
      expect(style).toContain(`${sample.property}:`);
    },
  );
});
