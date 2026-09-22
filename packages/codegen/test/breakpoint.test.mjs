import { describe, expect, it } from 'vitest';
import {
  MOBILE_BOUNDARY_TOKEN,
  mobileMediaQuery,
} from '../src/emit/breakpoint.mjs';
import { buildTokenSpec, loadContract } from '../src/normalize/tokens.mjs';
import { flattenSpec } from '../src/spec.mjs';

const index = new Map(
  flattenSpec(buildTokenSpec(loadContract()).spec).map((t) => [t.name, t]),
);

describe('mobileMediaQuery', () => {
  it('derives the query from the viewport token, not a number written by hand', () => {
    expect(index.get(MOBILE_BOUNDARY_TOKEN).value).toBe('768px');
    expect(mobileMediaQuery(index)).toBe('(max-width: 767.98px)');
  });

  it('follows the token if SOLAR moves the boundary', () => {
    const moved = new Map(index).set(MOBILE_BOUNDARY_TOKEN, { value: '900px' });
    expect(mobileMediaQuery(moved)).toBe('(max-width: 899.98px)');
  });

  it('refuses to guess when the token is gone', () => {
    const empty = new Map(index);
    empty.delete(MOBILE_BOUNDARY_TOKEN);
    expect(() => mobileMediaQuery(empty)).toThrow(/viewport\.sm is missing/);
  });
});
