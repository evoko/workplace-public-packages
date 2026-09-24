import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import {
  FLUTTER_STYLE,
  renderFlutterComponent,
  statePrecedence,
  stateTest,
} from '../src/emit/flutter-component.mjs';
import {
  restateOverlaps,
  STATE_SELECTORS,
} from '../src/emit/mui-component.mjs';

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

  it('carries every IR entry and every overlap restated, so nothing a web target draws is missing here', () => {
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
    const expected = Object.values(restateOverlaps(button)).reduce(
      (n, s) => n + count(s),
      0,
    );
    expect(Object.keys(cells)).toHaveLength(expected);
  });

  it('resolves states in the MUI cascade order, reversed', () => {
    expect(statePrecedence('Button')).toEqual([
      'disabled',
      'loading',
      'focus',
      'pressed',
      'hover',
    ]);
    expect([...statePrecedence('Button')].reverse()).toEqual(
      Object.keys(STATE_SELECTORS.Button).filter((s) => s !== 'default'),
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
    expect(dart).toContain('enum SolarButtonSize { md, sm, lg }');
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

describe('renderFlutterComponent on Spinner', () => {
  const spinner = built.find((b) => b.spec.component === 'Spinner').spec;
  const { dart: spinnerDart } = renderFlutterComponent(spinner, tokens);

  it('escapes a value that is a Dart keyword and keys the recipe by Figma’s spelling', () => {
    expect(spinnerDart).toContain("$default('default')");
    expect(spinnerDart).toContain(
      'this.variant = SolarSpinnerVariant.$default',
    );
    expect(spinnerDart).toContain(
      "final combo = 'variant=${p.variant.figma}';",
    );
  });

  it('tests no state it cannot be in, and builds no ButtonStyle', () => {
    expect(spinnerDart).toContain(
      'static const List<String> statePrecedence = <String>[];',
    );
    expect(spinnerDart).not.toContain('p.disabled');
    expect(spinnerDart).not.toContain('ButtonStyle');
  });

  it('refuses a track and indicator of different widths, which one strokeWidth draws', () => {
    const split = structuredClone(spinner);
    split.style.track.base.borderWidth = { token: 'border.default' };
    expect(() => renderFlutterComponent(split, tokens)).toThrow(
      /indicator.borderWidth and track.borderWidth with one property/,
    );
  });
});

describe('renderFlutterComponent: states that hold together', () => {
  it('restates what an overlapping state would show through, as the MUI recipe does', () => {
    // A mouse press is hovered and pressed at once; Figma's pressed tertiary is not underlined.
    expect(
      cells[
        'label.typography|combined|md|variant=tertiary, danger=false|pressed'
      ],
    ).toBe('t:typography.label.md');
    const restated = [];
    for (const [layer, s] of Object.entries(restateOverlaps(button)))
      for (const [size, byCombo] of Object.entries(s.combined ?? {}))
        for (const [combo, states] of Object.entries(byCombo))
          for (const [state, c] of Object.entries(states))
            for (const [cell, e] of Object.entries(c))
              if (e.restates)
                restated.push(
                  `${layer}.${cell}|combined|${size}|${combo}|${state}`,
                );
    expect(restated.length).toBeGreaterThan(0);
    for (const key of restated) expect(cells).toHaveProperty([key]);
  });
});

describe('renderFlutterComponent: states and builders, per component', () => {
  const spinner = built.find((b) => b.spec.component === 'Spinner').spec;
  const synthetic = {
    component: 'X',
    states: ['default', 'hover', 'focus'],
    api: {
      selected: { type: 'boolean', default: false },
      disabled: { type: 'boolean', default: false },
    },
  };

  it('detects a platform state by its WidgetState and a prop state by its prop', () => {
    expect(stateTest(synthetic, 'hover')).toBe(
      's.contains(WidgetState.hovered)',
    );
    expect(stateTest(synthetic, 'focus')).toBe(
      's.contains(WidgetState.focused)',
    );
    expect(stateTest(synthetic, 'selected')).toBe('p.selected');
    expect(stateTest(synthetic, 'disabled')).toBe(
      'p.disabled || s.contains(WidgetState.disabled)',
    );
    // Button's loading has no handler either, so its disabled look waits for the prop.
    expect(stateTest(button, 'disabled')).toBe(
      'p.disabled || (!p.loading && s.contains(WidgetState.disabled))',
    );
    // Pressed is a platform state only where the component draws it.
    expect(() => stateTest(synthetic, 'pressed')).toThrow(
      /X: no Flutter test for state pressed/,
    );
  });

  it('refuses a state it cannot detect, or cannot place in the order', () => {
    const copy = structuredClone(button);
    copy.style.root.appearance['variant=primary, danger=false'].selected = {
      background: { token: 'color.action.primary.bg.hover' },
    };
    expect(() => renderFlutterComponent(copy, tokens)).toThrow(
      /Button: no Flutter test for state selected/,
    );
    copy.api.selected = { type: 'boolean', default: false };
    expect(() => renderFlutterComponent(copy, tokens)).toThrow(
      /Button: state selected has no place in the state order/,
    );
  });

  it('builds the style object the base control takes, and none for one that takes none', () => {
    expect(dart).toContain('A [ButtonStyle] for a FilledButton');
    const { dart: spinnerDart } = renderFlutterComponent(spinner, tokens);
    expect(spinnerDart).not.toContain('ButtonStyle');
    const asIconButton = { ...spinner, base: { flutter: 'IconButton' } };
    expect(() => renderFlutterComponent(asIconButton, tokens)).toThrow(
      /Spinner: IconButton takes a ButtonStyle, and FLUTTER_STYLE has no table for it/,
    );
    const asSpinner = {
      ...button,
      base: { flutter: 'CircularProgressIndicator' },
    };
    expect(() => renderFlutterComponent(asSpinner, tokens)).toThrow(
      /Button: FLUTTER_STYLE has a table, and its base CircularProgressIndicator has no style builder/,
    );
  });
});

describe('renderFlutterComponent: glyphs', () => {
  const spinner = built.find((b) => b.spec.component === 'Spinner').spec;
  const { dart: sd, cells: sc } = renderFlutterComponent(spinner, tokens);

  it('lists each distinct glyph once and keys the cells by its index', () => {
    const glyphs = sd.match(/SolarGlyph\(/g).length;
    const refs = new Set(Object.values(sc).filter((v) => v.startsWith('g:')));
    expect(refs.size).toBe(glyphs);
    expect(sd).toContain("import '../../solar_glyph.dart';");
    expect(sd).toContain('static SolarGlyph? glyph(');
  });

  it('carries Figma’s path data byte for byte', () => {
    const d = spinner.style.indicator.base.glyph.glyph.stroke[0].d;
    expect(sd).toContain(d.slice(0, 60));
  });

  it('adds nothing to a component that draws no glyph', () => {
    expect(dart).not.toContain('SolarGlyph');
  });
});

describe('renderFlutterComponent: a layer with no auto-layout in a variant', () => {
  const group = structuredClone(
    built.find((b) => b.spec.component === 'Button Group').spec,
  );
  const none = { none: true };
  group.style.root.appearance['orientation=vertical, fullWidth=false'].default =
    {
      direction: none,
      gap: none,
      paddingLeft: none,
    };
  const { cells: vertical } = renderFlutterComponent(group, tokens);
  const at = (cell) =>
    vertical[
      `root.${cell}|appearance|orientation=vertical, fullWidth=false|default`
    ];

  it('reads its gap and padding as inset.none, a length like any other', () => {
    expect(at('gap')).toBe('t:inset.none');
    expect(at('paddingLeft')).toBe('t:inset.none');
  });

  it('keeps a none direction as none, for the shell to read', () => {
    expect(at('direction')).toBe('none');
  });
});

describe('renderFlutterComponent: a component with no axes', () => {
  it('writes a recipe of base cells alone, and a props class with nothing in it', async () => {
    const { buildComponentSpec, loadComponent, loadWebCatalog } =
      await import('../src/normalize/components.mjs');
    const { loadDefaults } = await import('../src/normalize/overlay.mjs');
    const { tokenNames } = await import('../src/normalize/recipe.mjs');
    const { loadContract } = await import('../src/normalize/tokens.mjs');
    const catalog = loadWebCatalog();
    const { spec } = buildComponentSpec(loadComponent(catalog, 'Scrim'), {
      names: tokenNames(loadContract()),
      fileVersion: catalog.fileVersion,
      defaults: loadDefaults(),
    });
    const { cells, dart } = renderFlutterComponent(spec, tokens);
    expect(Object.keys(cells).length).toBeGreaterThan(0);
    expect(Object.keys(cells).every((k) => k.endsWith('|base'))).toBe(true);
    // Dart refuses empty braces for named parameters, and a constant key must be const, so both
    // are written for a component with nothing to take.
    expect(dart).toContain('const SolarScrimProps();');
    expect(dart).toContain("const combo = '';");
  });
});
