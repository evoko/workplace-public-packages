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

  it('leaves only Figma’s md error inline spacing open', () => {
    expect(deviations.filter((d) => !d.decision).map((d) => d.token)).toEqual([
      'component.number input.field.gap@state=error',
      'component.number input.field.paddingLeft@state=error',
      'component.number input.field.paddingRight@state=error',
    ]);
  });

  it('is focused as the InputBase inside its field is', () => {
    const { styles } = renderMuiComponent(spec, tokens);
    expect(Object.keys(styles.appearances['stepper=inline'])).toContain(
      '&:has(.SolarNumberInput-field .Mui-focused)',
    );
  });
});
