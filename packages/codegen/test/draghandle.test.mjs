/**
 * DragHandle (milestone 4, F3): its IR, and the recipe each emitter makes of it. Drawn on both:
 * six dots, focusable, pressed while held.
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { renderMuiComponent } from '../src/emit/mui-component.mjs';

const { built, tokens } = stage.build();
const { spec, deviations } = built.find(
  (b) => b.spec.component === 'DragHandle',
);

describe('the DragHandle IR', () => {
  it('takes a size and disabled, with hover, focus and pressed, and every finding is decided', () => {
    expect(spec.api).toEqual({
      size: { values: ['sm', 'md'], default: 'sm' },
      disabled: { type: 'boolean', default: false },
    });
    expect(spec.states).toEqual(['default', 'hover', 'focus', 'pressed']);
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
  });

  it('draws two columns of three dots, 3px at sm and 4px at md', () => {
    expect(
      Object.keys(spec.layers).filter((l) => spec.layers[l].parent === 'col1'),
    ).toHaveLength(3);
    expect(spec.style.col2Dot3.base.width).toMatchObject({ literal: 3 });
    expect(spec.style.col2Dot3.size.md.width).toMatchObject({ literal: 4 });
  });
});

describe('the DragHandle recipe', () => {
  const { styles } = renderMuiComponent(spec, tokens);

  it('draws pressed while held, or while the caller’s drag says it is lifted', () => {
    expect(Object.keys(styles.appearances.default)).toContain(
      '&:active, &[aria-pressed="true"]',
    );
    expect(styles.reset.cursor).toBe('grab');
  });
});
