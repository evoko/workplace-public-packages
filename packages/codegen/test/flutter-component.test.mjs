import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import {
  FLUTTER_STYLE,
  renderFlutterComponent,
  STATE_PRECEDENCE,
} from '../src/emit/flutter-component.mjs';
import { STATE_SELECTORS } from '../src/emit/mui-component.mjs';

const { built, tokens } = stage.build();
const button = built.find((b) => b.spec.component === 'Button').spec;
const { dart, cells } = renderFlutterComponent(button, tokens);

describe('renderFlutterComponent on Button', () => {
  it('holds the recipe as token names, never as colour literals', () => {
    expect(dart).not.toMatch(/Color\(0x/);
    expect(cells['root.background|base']).toBe(
      't:color.action.primary.bg.default',
    );
    expect(
      cells['root.background|appearance|variant=primary, danger=false|hover'],
    ).toBe('t:color.action.primary.bg.hover');
  });

  it('reaches every colour through the theme’s SolarColors', () => {
    const colours = [...dart.matchAll(/'t:(color\.[^']+)' => (\S+),/g)];
    expect(colours.length).toBeGreaterThan(40);
    for (const [, , expr] of colours)
      expect(expr).toMatch(/^c\.[a-zA-Z0-9$]+$/);
  });

  it('carries every IR entry, so nothing a web target draws is missing here', () => {
    const count = (s) =>
      Object.values(s.base).length +
      Object.values(s.size).reduce((n, c) => n + Object.keys(c).length, 0) +
      Object.values(s.appearance).reduce(
        (n, st) =>
          n + Object.values(st).reduce((m, c) => m + Object.keys(c).length, 0),
        0,
      ) +
      Object.values(s.combined ?? {}).reduce(
        (n, byCombo) =>
          n +
          Object.values(byCombo).reduce(
            (m, st) =>
              m +
              Object.values(st).reduce((k, c) => k + Object.keys(c).length, 0),
            0,
          ),
        0,
      );
    const expected = Object.values(button.style).reduce(
      (n, s) => n + count(s),
      0,
    );
    expect(Object.keys(cells)).toHaveLength(expected);
  });

  it('resolves states in the MUI cascade order, reversed', () => {
    expect(STATE_PRECEDENCE).toEqual([
      'disabled',
      'loading',
      'focus',
      'pressed',
      'hover',
    ]);
    expect([...STATE_PRECEDENCE].reverse()).toEqual(
      Object.keys(STATE_SELECTORS).filter((s) => s !== 'default'),
    );
    expect(dart).toContain(
      "static const List<String> statePrecedence = ['disabled', 'loading', 'focus', 'pressed', 'hover'];",
    );
  });

  it('keeps hover, pressed and focus out of the props, and disabled and loading in', () => {
    expect(dart).toMatch(/final bool disabled;/);
    expect(dart).toMatch(/final bool loading;/);
    expect(dart).toMatch(/final bool danger;/);
    expect(dart).not.toMatch(/final bool hover/);
    expect(dart).toContain(
      'enum SolarButtonVariant { primary, secondary, tertiary }',
    );
    expect(dart).toContain('enum SolarButtonSize { md, sm, xl }');
  });

  it('refuses a style table naming a cell the IR does not have', () => {
    const saved = FLUTTER_STYLE.Button.iconSize;
    FLUTTER_STYLE.Button.iconSize = 'iconLeading.colour';
    try {
      expect(() => renderFlutterComponent(button, tokens)).toThrow(
        /iconSize reads iconLeading.colour, which the IR does not have/,
      );
    } finally {
      FLUTTER_STYLE.Button.iconSize = saved;
    }
  });

  it('draws both icons from the leading one, and refuses if the trailing one differs', () => {
    expect(dart).toContain("'iconLeading.color'");
    const split = structuredClone(button);
    split.style.iconTrailing.appearance[
      'variant=primary, danger=false'
    ].hover.color = { token: 'color.action.secondary.icon.hover' };
    expect(() => renderFlutterComponent(split, tokens)).toThrow(
      /draws iconLeading.color and iconTrailing.color with one property/,
    );
  });

  it('refuses a primitive colour, which a component must never use', () => {
    const bad = structuredClone(button);
    bad.style.root.base.background = { token: 'color.brand.red' };
    expect(() => renderFlutterComponent(bad, tokens)).toThrow(
      /color.brand.red is a primitive/,
    );
  });
});
