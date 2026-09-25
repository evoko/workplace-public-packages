/**
 * Number Input (milestone 4, F5): its IR, laid out by its stepper.
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { renderMuiComponent } from '../src/emit/mui-component.mjs';

const { built, tokens } = stage.build();
const { spec, deviations } = built.find(
  (b) => b.spec.component === 'Number Input',
);

describe('the Number Input IR', () => {
  it('takes a size, disabled, error and its stepper, inline or beside it', () => {
    expect(Object.keys(spec.api)).toEqual([
      'size',
      'disabled',
      'error',
      'stepper',
    ]);
    expect(spec.api.stepper.values).toEqual(['inline', 'side']);
    expect(spec.layers.inlineValue.path).toBe('/Field/0');
  });

  it('lays the field out by its stepper, the side one’s column flush right', () => {
    const side = spec.style.field.combined.md['stepper=side'].default;
    expect(side).toMatchObject({
      gap: { token: 'inset.none' },
      paddingLeft: { token: 'inset.md' },
      paddingRight: { token: 'inset.none' },
      width: { literal: 88 },
    });
    expect(spec.style.stepper.base.borderLeftWidth.token).toBe(
      'border.default',
    );
  });

  it('leaves nothing open', () => {
    // Figma's md error inline spacing, open until 2026-09-25, is the other states' since.
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
  });

  it('is focused as the InputBase inside its field is', () => {
    const { styles } = renderMuiComponent(spec, tokens);
    expect(Object.keys(styles.appearances['stepper=inline'])).toContain(
      '&:has(.SolarNumberInput--field .Mui-focused)',
    );
  });
});
