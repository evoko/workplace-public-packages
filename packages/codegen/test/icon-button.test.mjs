/**
 * Icon Button (3b-2 Task B1): its IR, and the recipe each emitter makes of it. The machinery is
 * Button's, so these hold what is particular to Icon Button: the icon slot the overlay declares,
 * the round shape, lg's flat look, and a ButtonStyle with no label.
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { renderMuiComponent } from '../src/emit/mui-component.mjs';
import { renderFlutterComponent } from '../src/emit/flutter-component.mjs';

const { built, tokens } = stage.build();
const { spec, deviations, oracle } = built.find(
  (b) => b.spec.component === 'Icon Button',
);
const { styles } = renderMuiComponent(spec, tokens);
const { dart, cells } = renderFlutterComponent(spec, tokens);

describe('the Icon Button IR', () => {
  it('has Figma’s API, with prio renamed variant as on Button', () => {
    expect(spec.api).toEqual({
      size: { values: ['lg', 'md', 'sm'], default: 'sm' },
      shape: { values: ['square', 'round'], default: 'square' },
      variant: {
        values: ['primary', 'secondary', 'tertiary'],
        default: 'primary',
      },
      disabled: { type: 'boolean', default: false },
      loading: { type: 'boolean', default: false },
    });
    expect(spec.states).toEqual(['default', 'hover', 'pressed', 'focus']);
    expect(spec.base).toEqual({ mui: 'IconButton', flutter: 'IconButton' });
  });

  it('makes the icon a slot the caller fills, which Figma records no prop for', () => {
    expect(spec.slots.icon).toMatchObject({
      layer: '/Icon/None',
      type: 'icon',
    });
    expect(Object.keys(spec.layers)).toEqual(['root', 'icon', 'spinner']);
  });

  it('decides every finding, and leaves none open', () => {
    expect(deviations.length).toBeGreaterThan(0);
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
  });

  it('rounds by shape at every size, and is flat at lg but keeps its focus ring', () => {
    const round = spec.style.root.combined;
    for (const size of ['sm', 'md', 'lg'])
      expect(
        round[size]['shape=round, variant=primary'].default.radius.token,
      ).toBe('radius.pill');
    const lg = spec.style.root.combined.lg['shape=square, variant=primary'];
    expect(lg.default.shadow).toMatchObject({ none: true });
    expect(lg.focus.shadow.token).toBe('shadow.focus.default');
  });

  it('keys the radius under every priority, though it follows shape alone', () => {
    // A cell that follows some of the appearance axes is written under each full key, since
    // both emitters look entries up by the full key; a partial one would never be found.
    for (const variant of ['primary', 'secondary', 'tertiary'])
      expect(
        spec.style.root.combined.md[`shape=round, variant=${variant}`].default
          .radius.token,
      ).toBe('radius.pill');
    for (const s of Object.values(spec.style))
      for (const key of [
        ...Object.keys(s.appearance),
        ...Object.values(s.combined ?? {}).flatMap((c) => Object.keys(c)),
      ])
        expect(key).toMatch(/^shape=\w+, variant=\w+$/);
  });

  it('is refused by the MUI emitter if a key names only some of the axes', () => {
    const partial = structuredClone(spec);
    partial.style.root.combined.md['shape=round'] = {
      default: { radius: { token: 'radius.pill' } },
    };
    expect(() => renderMuiComponent(partial, tokens)).toThrow(
      /appearance key shape=round does not name shape, variant/,
    );
  });

  it('sizes the icon from the icon ladder, one step per size', () => {
    expect(spec.style.icon.base.width.token).toBe('icon.xs');
    expect(spec.style.icon.size.md.width.token).toBe('icon.sm');
    expect(spec.style.icon.size.lg.width.token).toBe('icon.md');
  });

  it('draws what Figma draws, 32, 40 and 48 square, which its description gives as 28, 36, 44', () => {
    const at = (size) =>
      oracle.variants.find(
        (v) =>
          v.figma === `size=${size}, shape=square, prio=primary, state=default`,
      ).layers.root;
    expect([at('sm').height, at('md').height, at('lg').height]).toEqual([
      32, 40, 48,
    ]);
    expect(at('md').width).toBe(40);
  });
});

describe('the Icon Button recipe', () => {
  it('styles the icon box and marks states with MUI IconButton’s own classes', () => {
    expect(styles.root['& .SolarIconButton-icon']).toMatchObject({
      width: 'var(--solar-icon-xs)',
    });
    const primary = styles.appearances['shape=square, variant=primary'];
    expect(primary['&:hover']).toMatchObject({
      backgroundColor: 'var(--solar-color-action-primary-bg-hover)',
    });
    expect(primary).toHaveProperty(['&.MuiIconButton-loading']);
    expect(primary).toHaveProperty([
      '&.Mui-disabled:not(.MuiIconButton-loading)',
    ]);
  });

  it('builds a ButtonStyle with the icon as its foreground and no text style', () => {
    expect(dart).toContain('A [ButtonStyle] for a IconButton');
    expect(dart).toContain(
      "foregroundColor: by((s) => lookup('icon.color', p, s) == null ? null : color(t, 'icon.color', p, s))",
    );
    expect(dart).not.toContain('textStyle: by(');
    expect(
      cells['root.radius|combined|lg|shape=round, variant=primary|default'],
    ).toBe('t:radius.pill');
  });

  it('waits for the loading prop before drawing disabled, as Button does', () => {
    expect(dart).toContain(
      "'disabled' => p.disabled || (!p.loading && s.contains(WidgetState.disabled)),",
    );
  });
});
