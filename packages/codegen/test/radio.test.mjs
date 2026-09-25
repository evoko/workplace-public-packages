/**
 * Radio (milestone 4, F3): its IR, and the recipe each emitter makes of it. MUI's Radio and
 * Flutter's RawRadio, each checked by its group, the dot placed from the ring's outer edge.
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { renderMuiComponent } from '../src/emit/mui-component.mjs';
import { DESCRIPTORS } from '../src/components/index.mjs';

const { built, tokens } = stage.build();
const { spec, deviations } = built.find((b) => b.spec.component === 'Radio');

describe('the Radio IR', () => {
  it('takes checked and disabled, with hover and focus, and every finding is decided', () => {
    expect(Object.keys(spec.api).sort()).toEqual(['checked', 'disabled']);
    expect(spec.states).toEqual(['default', 'hover', 'focus']);
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
  });

  it('is checked by its group in Flutter, not by a parameter', () => {
    const radio = DESCRIPTORS.find((d) => d.name === 'Radio');
    expect(radio.api.flutter.checked).toEqual({ group: 'RadioGroup' });
  });
});

describe('the Radio recipe', () => {
  const { styles } = renderMuiComponent(spec, tokens);

  it('says the ring’s border, which the dot it places steps back by', () => {
    // Figma places the dot 4px from the ring's outer edge; CSS places it inside the border.
    expect(styles.root).toMatchObject({
      '--solar-placed-left': 'var(--solar-border-default)',
      '--solar-placed-top': 'var(--solar-border-default)',
    });
  });

  it('marks its states with MUI’s classes', () => {
    // Its hover is also a row's that it is the target of (an Option Row's: F6).
    expect(Object.keys(styles.appearances['checked=false'])).toEqual(
      expect.arrayContaining([
        '&:hover, .SolarStatesScope:hover &',
        '&.Mui-focusVisible',
        '&.Mui-disabled',
      ]),
    );
  });
});
