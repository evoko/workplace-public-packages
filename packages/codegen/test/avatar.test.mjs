/**
 * Avatar (milestone 4, F1): its IR, and the recipe each emitter makes of it. Its colour is the
 * caller's, any colour: Figma's colour and shade axes are samples (the overlay's `samples`), the
 * background is the caller's prop, and the initials' ink follows from it (`caller`).
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { renderMuiComponent } from '../src/emit/mui-component.mjs';
import { renderFlutterComponent } from '../src/emit/flutter-component.mjs';

const { built, tokens } = stage.build();
const { spec, deviations, oracle } = built.find(
  (b) => b.spec.component === 'Avatar',
);

describe('the Avatar IR', () => {
  it('takes a size, a type and any colour, not Figma’s nine seeds and five shades', () => {
    expect(spec.api).toEqual({
      size: { values: ['lg', 'md', 'sm', 'xs'], default: 'lg' },
      type: { values: ['text', 'photo', 'logo'], default: 'text' },
      color: { type: 'color', default: null },
    });
    expect(spec.callers).toMatchObject({
      'root.background': { prop: 'color' },
      'initials.color': { from: 'color' },
    });
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
  });

  it('names no primitive: without a colour it is SOLAR’s neutral avatar', () => {
    expect(spec.style.root.base.background).toMatchObject({
      token: 'color.surface.feedback.neutral.subtle',
    });
    expect(spec.style.initials.base.color).toMatchObject({
      token: 'color.text.primary',
    });
    const drawn = JSON.stringify(spec.style, (k, v) =>
      k === 'replaced' ? undefined : v,
    );
    expect(drawn).not.toMatch(/"token":"color\.(neutral|red|blue)\.\d+"/);
  });
});

describe('the Avatar oracle', () => {
  it('checks every Figma variant, each in the colour Figma samples as the caller’s', () => {
    // 115 since 2026-09-25, when Figma added the lg logo avatar.
    expect(oracle.variants).toHaveLength(115);
    const red = oracle.variants.find(
      (v) => v.figma === 'size=lg, type=text, color=red, shade=Dark',
    );
    expect(red.props).toEqual({ size: 'lg', type: 'text', color: '#410001' });
    expect(red.layers.root.background).toBe('#410001');
    // The background is compared; the ink, the shell's rule, is not. The radius a set decides
    // (the lg logo's slip, 2026-09-25) is excused wherever Figma's value appears, as any set's is.
    expect(red.excused.map((e) => [e.layer, e.property, e.decision])).toEqual([
      ['root', 'radius', 'set'],
      ['initials', 'color', 'caller'],
    ]);
  });

  it('gives a photo no colour of the caller’s', () => {
    const photo = oracle.variants.find((v) => v.figma.includes('type=photo'));
    expect(photo.props).not.toHaveProperty('color');
  });
});

describe('the Avatar recipe', () => {
  it('types the colour as any CSS colour on the web and a Color in Flutter', () => {
    const { ts } = renderMuiComponent(spec, tokens);
    expect(ts).toContain('color?: string;');
    const { dart } = renderFlutterComponent(spec, tokens);
    expect(dart).toContain('final Color? color;');
  });
});
