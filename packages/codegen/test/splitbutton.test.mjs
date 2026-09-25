/**
 * SplitButton (milestone 4, F2): its IR, and the recipe each emitter makes of it. Two press
 * targets drawn in one control, which takes the states of whichever half is used.
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { renderMuiComponent } from '../src/emit/mui-component.mjs';

const { built, tokens } = stage.build();
const { spec, deviations } = built.find(
  (b) => b.spec.component === 'SplitButton',
);

describe('the SplitButton IR', () => {
  it('takes a prio, a size, disabled and loading, and every finding is decided', () => {
    expect(Object.keys(spec.api)).toEqual([
      'prio',
      'size',
      'disabled',
      'loading',
    ]);
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
  });

  it('draws the rule between the halves as a hairline at 30%', () => {
    expect(spec.style.divider.base).toMatchObject({
      width: { token: 'border.default' },
      opacity: { literal: 0.3, allowed: expect.any(String) },
    });
  });
});

describe('the SplitButton recipe', () => {
  it('styles the whole control by the states of its halves', () => {
    const { styles } = renderMuiComponent(spec, tokens);
    const primary = styles.appearances['prio=primary'];
    expect(primary['&:hover']).toMatchObject({
      backgroundColor: 'var(--solar-color-action-primary-bg-hover)',
    });
    expect(primary['&:has(.Mui-focusVisible)']).toMatchObject({
      boxShadow: expect.stringContaining('--solar-shadow-focus-default'),
    });
  });
});
