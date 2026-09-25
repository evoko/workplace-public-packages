/**
 * GlobalSearch (milestone 4, F5): a trigger drawn as a field, by the owner's decision; its IR.
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';

const { built } = stage.build();
const { spec, deviations, oracle } = built.find(
  (b) => b.spec.component === 'GlobalSearch',
);

describe('the GlobalSearch IR', () => {
  it('takes a size and error, and is filled by the query it shows', () => {
    expect(Object.keys(spec.api)).toEqual(['error', 'size']);
    expect(spec.derived.filled.when[0]).toEqual({
      value: true,
      given: [],
      props: ['query'],
    });
    const filled = oracle.variants.find(
      (v) => v.figma === 'state=filled, size=md',
    );
    expect(filled.content).toEqual(['query']);
  });

  it('composes a Kbd, and leaves nothing open', () => {
    expect(spec.style.kbd.base.component.keyword).toBe('Kbd');
    // Figma's centred error trigger, open until 2026-09-25, is aligned as the others since.
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
  });
});
