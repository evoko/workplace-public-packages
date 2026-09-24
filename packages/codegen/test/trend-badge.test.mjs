/**
 * Trend Badge (milestone 4, F1): its IR, and the recipe each emitter makes of it. A drawing, as
 * StatusIndicator is: an arrow or a dash on a disc, and a dot alone at xs.
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { renderMuiComponent } from '../src/emit/mui-component.mjs';

const { built, tokens } = stage.build();
const { spec, deviations } = built.find(
  (b) => b.spec.component === 'Trend Badge',
);

describe('the Trend Badge IR', () => {
  it('is a drawing, and every finding is decided', () => {
    expect(Object.keys(spec.api)).toEqual(['type', 'size']);
    expect(spec.overlay.rules).toContainEqual(
      expect.objectContaining({ rule: 'drawing' }),
    );
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
  });

  it('is an icon size at md and sm, and 8px, allowed, at xs, with no mark', () => {
    expect(spec.style.root.base.width).toMatchObject({ token: 'icon.md' });
    const xs = spec.style.root.combined.xs['type=incline'].default;
    expect(xs.width).toMatchObject({ literal: 8, allowed: expect.any(String) });
    expect(
      spec.style.icon.combined.xs['type=incline'].default.present,
    ).toMatchObject({ value: false });
  });
});

describe('the Trend Badge recipe', () => {
  it('fills the arrow’s outline in the icon colour', () => {
    const { styles } = renderMuiComponent(spec, tokens);
    expect(styles.root['& .SolarTrendBadge-icon']).toMatchObject({
      fill: 'var(--solar-color-icon-inverse)',
    });
  });
});
