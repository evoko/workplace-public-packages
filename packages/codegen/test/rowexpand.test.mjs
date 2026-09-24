/**
 * RowExpand (milestone 4, F1): its IR, and the recipe each emitter makes of it. A drawing: a
 * chevron, a SOLAR icon, on the parent row, or a connector of vectors beside a child row.
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { renderMuiComponent } from '../src/emit/mui-component.mjs';
import { iconsOf } from '../src/shells/drawn.mjs';

const { built, tokens } = stage.build();
const { spec, deviations } = built.find(
  (b) => b.spec.component === 'RowExpand',
);

describe('the RowExpand IR', () => {
  it('is a drawing, and every finding is decided', () => {
    expect(spec.api.type.values).toContain('middle-row');
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
  });

  it('draws its chevrons as SOLAR icons, which the shells import', () => {
    expect(iconsOf(spec)).toEqual([
      {
        layer: 'iconChevronRight',
        react: 'IconChevronRight',
        solid: false,
        dart: 'SolarIcons.chevronRightOutline',
      },
      {
        layer: 'iconChevronDown',
        react: 'IconChevronDown',
        solid: false,
        dart: 'SolarIcons.chevronDownOutline',
      },
    ]);
  });
});

describe('the RowExpand recipe', () => {
  it('draws a connector’s outline, its corner already rounded in it', () => {
    const { styles } = renderMuiComponent(spec, tokens);
    const bottom =
      styles.appearances['type=bottom-row']['& .SolarRowExpand-container'];
    expect(bottom).toMatchObject({
      stroke: 'var(--solar-color-border-medium)',
    });
    expect(bottom).not.toHaveProperty('borderRadius');
  });
});
