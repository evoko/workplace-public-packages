/**
 * Password Input (milestone 4, F5): its IR, and the decisions that keep its helper and its
 * forgot-password link where the caller gives them, whatever the state.
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';

const { built } = stage.build();
const { spec, deviations, oracle } = built.find(
  (b) => b.spec.component === 'Password Input',
);

describe('the Password Input IR', () => {
  it('takes a size, disabled and error, derives filled, and draws SOLAR’s eye', () => {
    expect(Object.keys(spec.api)).toEqual(['size', 'disabled', 'error']);
    expect(spec.derived.filled.type).toBe('boolean');
    expect(spec.style.icon.base.component.keyword).toBe('Icon/Eye');
  });

  it('declares the forgot-password link a slot of its own, beside the helper', () => {
    expect(spec.slots.forgotPassword).toMatchObject({
      layer: '/Forgot password?',
      type: 'text',
    });
    // Shown where given in every state: the helper's presence does not follow the state.
    expect(
      spec.style.helper.appearance.default?.focus?.present,
    ).toBeUndefined();
    expect(spec.style.forgotPassword.base.color.token).toBe(
      'color.text.secondary',
    );
  });

  it('leaves nothing open, and shows its link when focused', () => {
    // Figma's centred sm fields, open until 2026-09-25, are aligned as the others since.
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
    const focus = oracle.variants.find(
      (v) => v.figma === 'size=md, state=focus',
    );
    expect(focus.layers.forgotPassword.hidden).toBeUndefined();
  });
});
