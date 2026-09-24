/**
 * Dropdown Item (milestone 4, F6's pioneer): its IR, and the focus that draws its hover.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { stateTest } from '../src/emit/flutter-component.mjs';
import { packagesDir } from '../src/util/paths.mjs';

const { built } = stage.build();
const { spec, deviations, oracle } = built.find(
  (b) => b.spec.component === 'Dropdown Item',
);

describe('the Dropdown Item IR', () => {
  it('takes a size, selected and disabled, and shows a checkbox, an icon and a second line', () => {
    expect(Object.keys(spec.api)).toEqual(['size', 'selected', 'disabled']);
    expect(spec.states).toEqual(['default', 'hover']);
    expect(Object.keys(spec.slots)).toEqual(['checkbox', 'icon', 'helper']);
    expect(spec.base.mui).toBe('MenuItem');
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
  });

  it('draws its checkbox as a Checkbox the recipe checks where the row is selected, hovered with it', () => {
    const box = spec.style.checkbox;
    expect(box.base.component.keyword).toBe('Checkbox');
    expect(box.appearance.default.selected['variant.checked'].keyword).toBe(
      'true',
    );
    expect(box.appearance.default.hover['variant.hover'].keyword).toBe('true');
    // Its box is its own, never the row's to size.
    expect(box.base.width.none).toBe(true);
    const hovered = oracle.variants.find(
      (v) => v.figma === 'size=md, state=hover',
    );
    expect(hovered.layers.checkbox.variant.hover).toBe('true');
  });
});

describe('a focused row draws the hover', () => {
  it('in Flutter, where the recipe’s hover holds under the focus too', () => {
    expect(stateTest(spec, 'hover')).toBe(
      's.contains(WidgetState.hovered) || s.contains(WidgetState.focused)',
    );
    // Only a platform state has a test of its own.
    expect(() => stateTest({ ...spec, states: ['default'] }, 'hover')).toThrow(
      /not one of its platform states/,
    );
  });

  it('on the web, where the hover matches MUI’s focus-visible, and the row’s box follows it', () => {
    const recipe = readFileSync(
      join(packagesDir, 'styles/src/generated/mui/components/dropdown-item.ts'),
      'utf8',
    );
    expect(recipe).toContain("'&:hover, &.Mui-focusVisible'");
    const checkbox = readFileSync(
      join(packagesDir, 'styles/src/generated/mui/components/checkbox.ts'),
      'utf8',
    );
    expect(checkbox).toContain(
      '.SolarStatesScope:hover &, .SolarStatesScope.Mui-focusVisible &',
    );
  });
});
