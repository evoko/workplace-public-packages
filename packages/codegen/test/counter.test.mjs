/**
 * Counter (milestone 4, F1): its IR, and the recipe each emitter makes of it. A drawn component
 * with states: its own where it is a control, the control's around it (a Button's) otherwise.
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { renderMuiComponent } from '../src/emit/mui-component.mjs';
import { renderFlutterComponent } from '../src/emit/flutter-component.mjs';

const { built, tokens } = stage.build();
const { spec, deviations } = built.find((b) => b.spec.component === 'Counter');

describe('the Counter IR', () => {
  it('takes a type and disabled, with hover and pressed, and names its text the value', () => {
    expect(spec.api).toEqual({
      type: {
        values: ['regular', 'danger', 'inverted', 'idle'],
        default: 'regular',
      },
      disabled: { type: 'boolean', default: false },
    });
    expect(spec.states).toEqual(['default', 'hover', 'pressed']);
    expect(spec.layers.value).toMatchObject({ path: '/0', type: 'TEXT' });
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
  });

  it('has no border when inverted, in every state, and a 20px badge height allowed', () => {
    expect(
      spec.style.root.appearance['type=inverted'].default.borderWidth,
    ).toMatchObject({ token: 'border.none' });
    expect(spec.style.root.base.height).toMatchObject({
      literal: 20,
      allowed: expect.any(String),
    });
  });
});

describe('the Counter recipe', () => {
  const { styles } = renderMuiComponent(spec, tokens);
  const regular = styles.appearances['type=regular'];

  it('hovers where it is a button, and where the button it sits in is hovered', () => {
    const hover = Object.keys(regular).find((k) => k.includes(':hover'));
    expect(hover).toBe(
      '&:is(button):not(:disabled):hover, button:not(:disabled):hover &',
    );
    expect(regular[hover]).toMatchObject({
      backgroundColor: 'var(--solar-color-action-primary-bg-hover)',
    });
  });

  it('is disabled by its prop, or by the disabled control around it', () => {
    expect(regular).toHaveProperty([
      '&.SolarCounter-disabled, button:disabled &, .Mui-disabled &',
    ]);
  });

  it('holds disabled by its prop or its states in Flutter', () => {
    const { dart } = renderFlutterComponent(spec, tokens);
    expect(dart).toContain(
      "'disabled' => p.disabled || s.contains(WidgetState.disabled)",
    );
  });
});
