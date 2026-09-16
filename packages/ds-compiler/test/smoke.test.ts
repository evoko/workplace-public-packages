import { describe, expect, it } from 'vitest';
import { COMPILER_NAME } from '../src/index.js';

describe('package', () => {
  it('exports the compiler name', () => {
    expect(COMPILER_NAME).toBe('@bwp-web/ds-compiler');
  });
});
