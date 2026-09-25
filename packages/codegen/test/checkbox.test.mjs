/**
 * Checkbox (milestone 4, F3 pioneer): its IR, and the recipe each emitter makes of it. MUI's
 * Checkbox on the web, drawn in Flutter; the box's layout only where it holds a mark, no edge on a
 * disabled checked box, and the resting mixed box given the edge every other one has.
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { renderMuiComponent } from '../src/emit/mui-component.mjs';
import { renderFlutterComponent } from '../src/emit/flutter-component.mjs';

const { built, tokens } = stage.build();
const { spec, deviations, oracle } = built.find(
  (b) => b.spec.component === 'Checkbox',
);

describe('the Checkbox IR', () => {
  it('takes checked, mixed and disabled, with hover and focus, and one finding left open', () => {
    expect(spec.api).toEqual({
      checked: { type: 'boolean', default: false },
      disabled: { type: 'boolean', default: false },
      mixed: { type: 'boolean', default: false },
    });
    expect(spec.states).toEqual(['default', 'focus', 'hover']);
    // The disabled mixed box Figma draws only under the pointer stays 3b-1's finding.
    expect(deviations.filter((d) => !d.decision).map((d) => d.kind)).toEqual([
      'compound-state',
    ]);
  });

  it('lays out only a box that holds a mark', () => {
    const root = spec.style.root;
    expect(root.base.direction).toMatchObject({ none: true });
    expect(
      root.appearance['checked=true, mixed=false'].default.direction,
    ).toMatchObject({ keyword: 'VERTICAL' });
  });

  it('draws a disabled checked box flat, and the resting mixed box with its edge', () => {
    const a = spec.style.root.appearance;
    expect(a['checked=true, mixed=false'].disabled.borderWidth).toMatchObject({
      none: true,
    });
    expect(a['checked=true, mixed=true'].default.borderColor).toMatchObject({
      token: 'color.border.medium',
      replaced: { none: true },
    });
  });

  it('excuses Figma’s edgeless mixed box at rest alone, not the states that draw their own', () => {
    const excused = oracle.variants
      .filter((v) => v.excused?.some((e) => e.decision === 'set'))
      .map((v) => v.figma);
    expect(excused).toEqual([
      'checked=true, disabled=false, hover=false, mixed=true, focus=false',
    ]);
  });
});

describe('the Checkbox recipe', () => {
  const { styles } = renderMuiComponent(spec, tokens);

  it('marks its states with MUI’s classes', () => {
    const checked = styles.appearances['checked=true, mixed=false'];
    // Its hover is also a row's that draws it (a Dropdown Item's, hovered or focused: F6).
    expect(Object.keys(checked)).toEqual(
      expect.arrayContaining([
        '&:hover, .SolarStatesScope:hover &, .SolarStatesScope.Mui-focusVisible &',
        '&.Mui-focusVisible',
        '&.Mui-disabled',
      ]),
    );
    expect(styles.reset.padding).toBe('0');
  });

  it('draws the tick with no stroke, though the box the base reads draws none', () => {
    expect(styles.root['& .SolarCheckbox--icon']).toMatchObject({
      strokeWidth: '0',
    });
    expect(styles.root['& .SolarCheckbox--icon']).not.toHaveProperty(
      'borderStyle',
    );
  });

  it('gives Flutter the tick where checked, the dash where mixed, and neither a stroke', () => {
    const { cells } = renderFlutterComponent(spec, tokens);
    expect(
      cells['icon.glyph|appearance|checked=true, mixed=false|default'],
    ).toMatch(/^g:\d+$/);
    expect(
      cells['container.glyph|appearance|checked=true, mixed=true|default'],
    ).toMatch(/^g:\d+$/);
    expect(cells['icon.borderWidth|base']).toBe('none');
  });
});
