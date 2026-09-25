/**
 * PIN Input (milestone 4, F5): its IR, its named cells, and the oracle's reading of a text style a
 * `set` draws.
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';

const { built } = stage.build();
const { spec, deviations, oracle } = built.find(
  (b) => b.spec.component === 'PIN Input',
);

describe('the PIN Input IR', () => {
  it('names each cell’s digit and placeholder, and its error message a slot', () => {
    expect(spec.layers.digit.path).toBe('/Cells/Field/1');
    expect(spec.layers.placeholder6.path).toBe('/Cells/Field#6/0');
    expect(spec.slots.errorMessage.layer).toBe(
      '/Code is incorrect or expired.',
    );
    expect(spec.style.digit3.base.color.token).toBe('color.text.primary');
  });

  it('decides every finding: the row hugs its cells, the sm placeholders are body.md.medium', () => {
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
    expect(spec.style.cells.base.height).toMatchObject({ keyword: 'HUG' });
    expect(spec.style.placeholder.size.sm.typography.token).toBe(
      'typography.body.md.medium',
    );
  });

  it('draws the sm placeholder in Figma’s own text style, with nothing to excuse', () => {
    // An overlay set gave it until 2026-09-25, when Figma drew it.
    const sm = oracle.variants.find(
      (v) => v.figma === 'size=sm, state=default',
    );
    expect((sm.excused ?? []).filter((e) => e.layer === 'placeholder')).toEqual(
      [],
    );
  });
});
