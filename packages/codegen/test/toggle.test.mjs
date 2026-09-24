/**
 * Toggle (milestone 4, F3): its IR, and the recipe each emitter makes of it. MUI's Switch on the
 * web, drawn in Flutter; SOLAR's focus ring where Figma draws no focus, and a flat disabled thumb.
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { renderMuiComponent } from '../src/emit/mui-component.mjs';

const { built, tokens } = stage.build();
const { spec, deviations } = built.find((b) => b.spec.component === 'Toggle');

describe('the Toggle IR', () => {
  it('takes selected and disabled, and gains the focus Figma does not draw', () => {
    expect(Object.keys(spec.api).sort()).toEqual(['disabled', 'selected']);
    expect(spec.states).toEqual(['default', 'hover', 'focus']);
    for (const on of ['selected=false', 'selected=true'])
      expect(spec.style.root.appearance[on].focus.shadow).toMatchObject({
        token: 'shadow.focus.default',
      });
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
  });

  it('draws a disabled thumb with no edge, off or on', () => {
    for (const on of ['selected=false', 'selected=true'])
      expect(
        spec.style.thumb.appearance[on].disabled.borderWidth,
      ).toMatchObject({ none: true });
  });
});

describe('the Toggle recipe', () => {
  const { styles } = renderMuiComponent(spec, tokens);

  it('rings the track when its input has keyboard focus', () => {
    expect(
      styles.appearances['selected=true']['&:has(.Mui-focusVisible)'],
    ).toMatchObject({ boxShadow: 'var(--solar-shadow-focus-default)' });
  });

  it('gives way MUI’s own track and slide to the recipe’s', () => {
    expect(styles.reset['& .MuiSwitch-track']).toEqual({ display: 'none' });
    expect(
      styles.reset[
        '& .MuiSwitch-switchBase, & .MuiSwitch-switchBase.Mui-checked'
      ],
    ).toMatchObject({ transform: 'none', inset: '0' });
  });
});
