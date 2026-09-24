/**
 * Token Input (milestone 4, F5): its IR, which derives two of its states from what it holds.
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';

const { built } = stage.build();
const { spec, deviations, oracle } = built.find(
  (b) => b.spec.component === 'Token Input',
);

describe('the Token Input IR', () => {
  it('takes a size, disabled, error and readonly; filled and active are derived', () => {
    expect(Object.keys(spec.api)).toEqual([
      'size',
      'disabled',
      'error',
      'readonly',
    ]);
    expect(spec.derived.filled.when[0].props).toEqual(['value']);
    expect(spec.derived.active.when[0].props).toEqual(['inputValue']);
    // Both derived state values reach the oracle, each by its own content.
    const at = (figma) => oracle.variants.find((v) => v.figma === figma);
    expect(at('size=md, state=filled').content).toEqual(['value']);
    expect(at('size=md, state=active').content).toEqual(['inputValue']);
  });

  it('draws its tokens as Tags, text-only where they cannot be removed', () => {
    expect(spec.style.tag.base.component.keyword).toBe('Tag');
    expect(
      spec.style.tag.appearance.default.readonly['variant.type'].keyword,
    ).toBe('text-only');
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
  });
});
