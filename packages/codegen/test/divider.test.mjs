/**
 * Divider (milestone 4, F1): its IR, and the recipe each emitter makes of it. A drawn component: a
 * rule, an inset rule, or a label between two rules, which fills what it separates.
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { renderMuiComponent } from '../src/emit/mui-component.mjs';

const { built, tokens } = stage.build();
const { spec, deviations } = built.find((b) => b.spec.component === 'Divider');

describe('the Divider IR', () => {
  it('reads the label’s style where it is drawn, and every finding is decided', () => {
    // The label exists in with-label alone; its text style is read there, not dropped.
    expect(spec.style.label.base.typography).toMatchObject({
      token: 'typography.label.sm',
    });
    expect(spec.style.rule2.base.height).toMatchObject({
      token: 'border.default',
    });
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
  });

  it('fills its container, and is a hairline across', () => {
    expect(spec.style.root.base.width).toMatchObject({ keyword: 'FILL' });
    expect(spec.style.root.base.height).toMatchObject({
      token: 'border.default',
    });
    const vertical =
      spec.style.root.appearance['orientation=vertical, type=full'].default;
    expect(vertical.height).toMatchObject({ keyword: 'FILL' });
    expect(vertical.width).toMatchObject({ token: 'border.default' });
  });
});

describe('the Divider recipe', () => {
  it('is a block, the rule in the subtle border colour', () => {
    const { styles } = renderMuiComponent(spec, tokens);
    expect(styles.reset.display).toBe('flex');
    expect(styles.root['& .SolarDivider-rule']).toMatchObject({
      backgroundColor: 'var(--solar-color-border-subtle)',
      height: 'var(--solar-border-default)',
    });
    expect(
      styles.appearances['orientation=horizontal, type=inset'].paddingLeft,
    ).toBe('var(--solar-inset-md)');
  });
});
