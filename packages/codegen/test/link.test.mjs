/**
 * Link (milestone 4, F2): its IR, and the recipe each emitter makes of it. MUI's Link on the web,
 * drawn in Flutter; the link/* text styles, its xs reattached, and SOLAR's focus ring.
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { renderMuiComponent } from '../src/emit/mui-component.mjs';
import { iconsOf } from '../src/shells/icons.mjs';

const { built, tokens } = stage.build();
const { spec, deviations, oracle } = built.find(
  (b) => b.spec.component === 'Link',
);

describe('the Link IR', () => {
  it('takes a size and disabled, with two icon slots, and every finding is decided', () => {
    expect(spec.api).toEqual({
      size: { values: ['xs', 'sm', 'md'], default: 'md' },
      disabled: { type: 'boolean', default: false },
    });
    expect(spec.slots.leadingIcon.type).toBe('icon');
    // Slots are the caller's: the shells import no icon for them.
    expect(iconsOf(spec)).toEqual([]);
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
  });

  it('draws xs in link/xs, whose style Figma detached, and underlines hover', () => {
    const xs = spec.style.label.combined.xs.default;
    expect(xs.default.typography).toMatchObject({
      token: 'typography.link.xs.default',
    });
    expect(xs.hover.typography).toMatchObject({
      token: 'typography.link.xs.hover',
    });
  });

  it('excuses Figma’s ringless focus, which is drawn with SOLAR’s ring', () => {
    const focus = oracle.variants.find(
      (v) => v.figma === 'size=md, state=focus',
    );
    expect(
      focus.excused
        .filter((e) => e.property === 'shadow')
        .map((e) => e.decision),
    ).toEqual(['set']);
  });
});

describe('the Link recipe', () => {
  it('colours the words and icons by state, and gives way to SOLAR’s ring', () => {
    const { styles } = renderMuiComponent(spec, tokens);
    expect(styles.reset['&.Mui-focusVisible']).toEqual({ outline: 'none' });
    expect(
      styles.appearances.default['&:hover']['& .SolarLink--label'],
    ).toMatchObject({ color: 'var(--solar-color-text-link-hover)' });
  });
});
