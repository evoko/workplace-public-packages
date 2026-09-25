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
  it('has Figma’s API, prio in SOLAR’s word, as on Button', () => {
    expect(spec.api).toEqual({
      size: { values: ['lg', 'md', 'sm'], default: 'sm' },
      shape: { values: ['square', 'round'], default: 'square' },
      prio: {
        values: ['primary', 'secondary', 'tertiary'],
        default: 'primary',
      },
      disabled: { type: 'boolean', default: false },
      loading: { type: 'boolean', default: false },
      // A toggle icon button's on state, Figma's active (2026-09-25).
      active: { type: 'boolean', default: false },
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

  it('rounds by shape at every size, and rings lg’s focus, raised as the other sizes', () => {
    const round = spec.style.root.combined;
    for (const size of ['sm', 'md', 'lg'])
      expect(
        round[size]['shape=round, prio=primary'].default.radius.token,
      ).toBe('radius.pill');
    // Flat at lg until 2026-09-25; the control shadow at every size since.
    const lg = spec.style.root.combined.lg['shape=square, prio=primary'];
    expect(lg.default).toBeUndefined();
    expect(lg.focus.shadow.token).toBe('shadow.focus.default');
  });

  it('draws the active state, a toggle’s on state, as the pressed one’s colours', () => {
    const primary = spec.style.root.appearance['shape=square, prio=primary'];
    expect(primary.active.background.token).toBe(
      'color.action.primary.bg.active',
    );
    expect(primary.active.borderColor.token).toBe(
      'color.action.primary.border.active',
    );
  });

  it('keys the radius under every priority, though it follows shape alone', () => {
    // A cell that follows some of the appearance axes is written under each full key, since
    // both emitters look entries up by the full key; a partial one would never be found.
    for (const variant of ['primary', 'secondary', 'tertiary'])
      expect(
        spec.style.root.combined.md[`shape=round, prio=${variant}`].default
          .radius.token,
      ).toBe('radius.pill');
    for (const s of Object.values(spec.style))
      for (const key of [
        ...Object.keys(s.appearance),
        ...Object.values(s.combined ?? {}).flatMap((c) => Object.keys(c)),
      ])
        expect(key).toMatch(/^shape=\w+, prio=\w+$/);
  });

  it('is refused by the MUI emitter if a key names only some of the axes', () => {
    const partial = structuredClone(spec);
    partial.style.root.combined.md['shape=round'] = {
      default: { radius: { token: 'radius.pill' } },
    };
    expect(() => renderMuiComponent(partial, tokens)).toThrow(
      /appearance key shape=round does not name shape, prio/,
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
    const primary = styles.appearances['shape=square, prio=primary'];
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
      cells['root.radius|combined|lg|shape=round, prio=primary|default'],
    ).toBe('t:radius.pill');
  });

  it('waits for the loading prop before drawing disabled, as Button does', () => {
    expect(dart).toContain(
      "'disabled' => p.disabled || (!p.loading && s.contains(WidgetState.disabled)),",
    );
  });
});
