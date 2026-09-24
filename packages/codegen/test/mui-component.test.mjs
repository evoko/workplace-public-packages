import { describe, expect, it } from 'vitest';
import { targetArea } from '../src/scaffold/target.mjs';
import * as stage from '../src/stages/components.mjs';
import { buildTokenSpec, loadContract } from '../src/normalize/tokens.mjs';
import {
  renderMuiComponent,
  restateOverlaps,
  MUI_SLOTS,
  MUI_SVG_LAYERS,
  OVERLAPS,
  STATE_SELECTORS,
  stateSelectors,
} from '../src/emit/mui-component.mjs';
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { flattenSpec } from '../src/spec.mjs';

const tokens = buildTokenSpec(loadContract()).spec;
const { built } = stage.build();
const button = built.find((b) => b.spec.component === 'Button').spec;
const { ts, styles } = renderMuiComponent(button, tokens);

/** Every string value in a nested style object, with the path that reaches it. */
function leaves(node, at = '') {
  return Object.entries(node).flatMap(([k, v]) =>
    v && typeof v === 'object' ? leaves(v, `${at}/${k}`) : [[`${at}/${k}`, v]],
  );
}

const cssVars = new Set(
  flattenSpec(tokens)
    .filter((t) => t.type !== 'typography')
    .map((t) => `--solar-${t.name.replaceAll('.', '-')}`),
);

describe('renderMuiComponent on Button: the recipe as data', () => {
  it('references tokens as custom properties, never as resolved values', () => {
    expect(styles.root.borderRadius).toBe('var(--solar-radius-control)');
    expect(styles.root.paddingLeft).toBe('var(--solar-inset-sm)');
    // Primary is the default, so its resting background is the base; the others override it.
    expect(styles.root.backgroundColor).toBe(
      'var(--solar-color-action-primary-bg-default)',
    );
    expect(
      styles.appearances['variant=secondary, danger=false'].backgroundColor,
    ).toBe('var(--solar-color-action-secondary-bg-default)');
    expect(ts).not.toMatch(/#[0-9a-f]{6}\b/i);
  });

  it('names only custom properties that tokens.css defines', () => {
    const used = [...ts.matchAll(/var\((--solar-[a-z0-9-]+)\)/g)].map(
      (m) => m[1],
    );
    expect(used.length).toBeGreaterThan(50);
    for (const name of used) expect(cssVars, name).toContain(name);
  });

  it('holds only token references, CSS keywords, and the literals the overlay allowed', () => {
    const KEYWORDS = new Set([
      'transparent',
      'none',
      'solid',
      'row',
      'center',
      'space-between',
      '100%',
      'underline',
    ]);
    const allowed = new Set(['40px', '32px', '48px', '200px', '20px']);
    // The MUI resets are the one place a bare 0 or 100% appears: they undo MUI's own defaults.
    // They also hold the 44 × 44 target, whose one raw size is TARGET (scaffold/target.mjs), the
    // governance gap it names, and nothing else raw.
    const { reset, ...recipe } = styles;
    const target = Object.values(targetArea()).flatMap((d) => Object.values(d));
    for (const [, value] of leaves(reset))
      expect(['0', '100%', 'none', 'auto', ...target]).toContain(value);
    for (const [at, value] of leaves(recipe)) {
      const ok =
        /^var\(--solar-[a-z0-9-]+\)$/.test(value) ||
        KEYWORDS.has(value) ||
        allowed.has(value) ||
        /^-?[\d.]+em$/.test(value); // letter spacing, derived from the text style token
      expect(ok, `${at}: ${value}`).toBe(true);
    }
  });

  it('has the three sizes, with md as the base', () => {
    expect(Object.keys(styles.sizes)).toEqual(['sm', 'lg']);
    expect(styles.sizes.sm.paddingLeft).toBe('var(--solar-inset-xs)');
    expect(styles.sizes.lg.borderRadius).toBe('var(--solar-radius-none)');
    expect(styles.sizes.lg.justifyContent).toBe('space-between');
  });

  it('draws lg flat, as Figma does: no appearance of lg inherits the base shadow', () => {
    expect(styles.root.boxShadow).toBe('var(--solar-shadow-control)');
    for (const [combo, style] of Object.entries(styles.combined.lg))
      expect(style.boxShadow, combo).toBe('none');
  });

  it('undoes the MUI defaults SOLAR does not draw, before anything else applies', () => {
    expect(styles.reset.minWidth).toBe('auto');
    expect(styles.reset['& .MuiButton-startIcon']).toEqual({ margin: '0' });
    expect(ts).toMatch(/return merge\(\s*s\.reset,/);
  });

  it('has every variant with and without danger', () => {
    expect(Object.keys(styles.appearances).sort()).toEqual([
      'variant=primary, danger=false',
      'variant=primary, danger=true',
      'variant=secondary, danger=false',
      'variant=secondary, danger=true',
      'variant=tertiary, danger=false',
      'variant=tertiary, danger=true',
    ]);
  });
});

describe('renderMuiComponent on Button: states', () => {
  const primary = styles.appearances['variant=primary, danger=false'];

  it('renders platform states as the selectors MUI styleOverrides expects', () => {
    expect(primary['&:hover'].backgroundColor).toBe(
      'var(--solar-color-action-primary-bg-hover)',
    );
    expect(primary['&:active'].backgroundColor).toBe(
      'var(--solar-color-action-primary-bg-active)',
    );
    // The shadow follows size too (lg is flat), so it sits in the per-size section.
    expect(
      styles.combined.md['variant=primary, danger=false']['&.Mui-focusVisible']
        .boxShadow,
    ).toBe('var(--solar-shadow-focus-default)');
  });

  it('renders disabled and loading as the classes MUI sets for those props', () => {
    expect(
      primary['&.Mui-disabled:not(.MuiButton-loading)'].backgroundColor,
    ).toBe('var(--solar-color-action-primary-bg-disabled)');
    expect(primary).toHaveProperty(['&.MuiButton-loading']);
  });

  it('puts disabled after hover, so it wins at equal specificity, as CSS order decides', () => {
    const keys = Object.keys(primary);
    const disabled = keys.indexOf('&.Mui-disabled:not(.MuiButton-loading)');
    expect(disabled).toBeGreaterThan(keys.indexOf('&:hover'));
    expect(disabled).toBeGreaterThan(keys.indexOf('&:active'));
  });

  it('says a missing background is transparent, rather than inheriting primary', () => {
    expect(
      styles.appearances['variant=tertiary, danger=false'].backgroundColor,
    ).toBe('transparent');
  });

  it('places a child layer’s paint under its MUI slot selector', () => {
    expect(styles.root['& .MuiButton-startIcon'].color).toBe(
      'var(--solar-color-action-primary-icon-default)',
    );
    expect(styles.root['& .MuiButton-endIcon'].color).toBe(
      'var(--solar-color-action-primary-icon-default)',
    );
    expect(primary['&:hover']['& .MuiButton-startIcon'].color).toBe(
      'var(--solar-color-action-primary-icon-hover)',
    );
  });

  it('carries a cell that follows size and appearance at once', () => {
    // Owner decision: tertiary hover switches the label to a link style at every size.
    expect(
      styles.combined.md['variant=tertiary, danger=false']['&:hover'].fontSize,
    ).toBe('var(--solar-type-size-body-md)');
  });
});

describe('renderMuiComponent on Button: types and module', () => {
  it('types the props from the API, with no MUI import', () => {
    expect(ts).toContain(
      "export type SolarButtonVariant = 'primary' | 'secondary' | 'tertiary';",
    );
    expect(ts).toContain("export type SolarButtonSize = 'md' | 'sm' | 'lg';");
    expect(ts).toMatch(/danger\?: boolean;/);
    expect(ts).toMatch(/disabled\?: boolean;/);
    expect(ts).toMatch(/loading\?: boolean;/);
    expect(ts).not.toMatch(/hover\?:/);
    expect(ts).not.toMatch(/from '@mui/);
  });

  it('resolves props left undefined to their defaults, as a forwarding shell passes them', () => {
    expect(ts).toContain('if (v !== undefined) p[k] = v;');
    expect(ts).not.toContain('...props };');
  });

  it('exports the defaults and a pure style resolver', () => {
    expect(ts).toContain('export const solarButtonDefaults');
    expect(ts).toContain('export function solarButtonStyle(');
  });

  it('expands a text style into the custom properties it is made of', () => {
    expect(styles.root.fontSize).toBe('var(--solar-type-size-label-md)');
    expect(styles.root.lineHeight).toBe(
      'var(--solar-type-line-height-label-md)',
    );
    expect(styles.root.fontFamily).toBe('var(--solar-type-font-family-inter)');
    expect(styles.root.fontWeight).toBe('var(--solar-type-font-weight-500)');
  });

  it('refuses a layer it has no MUI slot for', () => {
    const extra = structuredClone(button);
    extra.layers.badge = { path: '/Badge', parent: 'root', type: 'FRAME' };
    extra.style.badge = { base: {}, size: {}, appearance: {} };
    expect(() => renderMuiComponent(extra, tokens)).toThrow(
      /Button: no MUI slot for layer badge/,
    );
    expect(MUI_SLOTS.Button.root).toBe('&');
  });
});

describe('renderMuiComponent on Spinner', () => {
  const spinner = built.find((b) => b.spec.component === 'Spinner').spec;
  const out = renderMuiComponent(spinner, tokens);

  it('draws the ring as SVG strokes on CircularProgress, not as CSS borders', () => {
    expect(out.styles.root['& .MuiCircularProgress-track']).toEqual({
      fill: 'none',
      stroke: 'var(--solar-color-border-subtle)',
      strokeWidth: 'var(--solar-border-strong)',
    });
    expect(
      out.styles.appearances['variant=inverse'][
        '& .MuiCircularProgress-circle'
      ],
    ).toEqual({ stroke: 'var(--solar-color-border-inverse-strong)' });
  });

  it('sizes the box the progress fills', () => {
    expect(out.styles.root.width).toBe('16px');
    expect(out.styles.sizes.lg).toEqual({ width: '32px', height: '32px' });
  });
});

describe('the generated compose lookup', () => {
  // Loaded as the module a shell imports, so it is the artifact, not the emitter, under test.
  const dir = mkdtempSync(join(tmpdir(), 'solar-compose-'));
  const load = async () => {
    const { ts: source } = renderMuiComponent(button, tokens);
    const file = join(dir, 'button.ts');
    writeFileSync(file, source);
    return import(file);
  };

  it('says which Spinner a loading Button shows, by variant and size', async () => {
    const { solarButtonCompose } = await load();
    expect(solarButtonCompose({}, 'loading').spinner).toMatchObject({
      present: true,
      'variant.size': 'sm',
      'variant.style': 'inverse',
    });
    expect(
      solarButtonCompose({ variant: 'secondary' }, 'loading').spinner[
        'variant.style'
      ],
    ).toBe('default');
    expect(
      solarButtonCompose({ size: 'lg' }, 'loading').spinner['variant.size'],
    ).toBe('md');
    // At rest the spinner is not drawn and the label is.
    const rest = solarButtonCompose();
    expect(rest.spinner.present).toBe(false);
    expect(rest.label.present).toBe(true);
    expect(solarButtonCompose({}, 'loading').label.present).toBe(false);
    rmSync(dir, { recursive: true, force: true });
  });
});

describe('states that overlap in CSS', () => {
  const restated = restateOverlaps(button);

  it('restates hover’s link style as rest for tertiary pressed, per size', () => {
    const combo = 'variant=tertiary, danger=false';
    const hover = (z) => button.style.label.combined[z][combo].hover.typography;
    const pressed = (z) => restated.label.combined[z][combo].pressed.typography;
    // Figma's pressed tertiary is not underlined; in CSS it is also hovered.
    expect(hover('md').token).toBe('typography.link.md.hover');
    expect(pressed('md')).toMatchObject({
      token: 'typography.label.md',
      restates: 'hover',
    });
    // sm draws its own pressed style, so there is nothing to restate.
    expect(pressed('sm')).toMatchObject({ token: 'typography.label.sm' });
    expect(pressed('sm')).not.toHaveProperty('restates');
  });

  it('restates only where an earlier state would show through, and only states that overlap', () => {
    const all = [];
    for (const [layer, s] of Object.entries(restated))
      for (const byCombo of Object.values(s.combined ?? {}))
        for (const states of Object.values(byCombo))
          for (const [state, cells] of Object.entries(states))
            for (const [cell, e] of Object.entries(cells))
              if (e.restates) all.push({ layer, cell, state, by: e.restates });
    expect(all.length).toBeGreaterThan(0);
    for (const { state, by } of all)
      expect(OVERLAPS.Button[state]).toContain(by);
    // A disabled or loading MUI button takes no pointer and no focus: nothing to restate there.
    expect(all.some((x) => ['disabled', 'loading'].includes(x.state))).toBe(
      false,
    );
  });

  it('leaves the IR itself as it was', () => {
    expect(JSON.stringify(button.style)).not.toContain('restates');
  });
});

describe('state selectors, per component', () => {
  const spinner = built.find((b) => b.spec.component === 'Spinner').spec;
  const paint = { token: 'color.action.primary.bg.hover' };
  /** A copy of a spec whose first layer with an appearance draws one more state there. */
  const withState = (spec, state) => {
    const copy = structuredClone(spec);
    const [layer, s] = Object.entries(copy.style).find(
      ([, x]) => Object.keys(x.appearance).length,
    );
    const combo = Object.keys(s.appearance)[0];
    s.appearance[combo][state] = { background: paint };
    return { copy, combo, layer };
  };

  it('styles a state by the component’s own table', () => {
    const { copy, combo, layer } = withState(spinner, 'hover');
    STATE_SELECTORS.Spinner = { default: null, hover: '&.SolarSpinner-hover' };
    try {
      const { styles: s } = renderMuiComponent(copy, tokens);
      const at = MUI_SLOTS.Spinner[layer];
      const node = s.appearances[combo]['&.SolarSpinner-hover'];
      // An SVG layer takes its background as a fill.
      expect(at === '&' ? node : node[at]).toMatchObject({
        [MUI_SVG_LAYERS.Spinner.includes(layer) ? 'fill' : 'backgroundColor']:
          'var(--solar-color-action-primary-bg-hover)',
      });
    } finally {
      delete STATE_SELECTORS.Spinner;
    }
  });

  it('refuses a state the component has no selector for, rather than leaving it unstyled', () => {
    expect(() =>
      renderMuiComponent(withState(spinner, 'hover').copy, tokens),
    ).toThrow(/Spinner \w+: no MUI selector for state hover/);
    expect(() =>
      renderMuiComponent(withState(button, 'selected').copy, tokens),
    ).toThrow(/Button root: no MUI selector for state selected/);
  });

  it('refuses a table that would let a weaker state win', () => {
    const saved = STATE_SELECTORS.Button;
    const { disabled, ...rest } = saved;
    STATE_SELECTORS.Button = { default: null, disabled, ...rest };
    try {
      expect(() => stateSelectors('Button')).toThrow(
        /Button: states must be ordered hover, pressed, focus, loading, disabled, weakest first/,
      );
    } finally {
      STATE_SELECTORS.Button = saved;
    }
  });

  it('gives a component with no table no states, and no overlaps', () => {
    expect(stateSelectors('Spinner')).toEqual({ default: null });
    expect(restateOverlaps(spinner)).toEqual(spinner.style);
  });
});

describe('a layer with no auto-layout in a variant', () => {
  // Button Group, its vertical group drawn with no auto-layout: the recipe writes that as none.
  const group = structuredClone(
    built.find((b) => b.spec.component === 'Button Group').spec,
  );
  const none = { none: true };
  group.style.root.appearance['orientation=vertical, fullWidth=false'].default =
    {
      direction: none,
      align: none,
      gap: none,
      paddingTop: none,
    };
  const vertical = renderMuiComponent(group, tokens).styles.appearances[
    'orientation=vertical, fullWidth=false'
  ];

  it('has no gap or padding, written as inset.none so the base’s are overridden', () => {
    expect(vertical.gap).toBe('var(--solar-inset-none)');
    expect(vertical.paddingTop).toBe('var(--solar-inset-none)');
  });

  it('restates no flex direction or alignment', () => {
    expect(vertical).not.toHaveProperty('flexDirection');
    expect(vertical).not.toHaveProperty('justifyContent');
  });
});

describe('a component with no axes (Scrim, one Figma drew with no variants)', () => {
  it('renders its recipe as the root style alone', async () => {
    const { buildComponentSpec, loadComponent, loadWebCatalog } =
      await import('../src/normalize/components.mjs');
    const { loadDefaults } = await import('../src/normalize/overlay.mjs');
    const { tokenNames } = await import('../src/normalize/recipe.mjs');
    const catalog = loadWebCatalog();
    const { spec } = buildComponentSpec(loadComponent(catalog, 'Scrim'), {
      names: tokenNames(loadContract()),
      fileVersion: catalog.fileVersion,
      defaults: loadDefaults(),
    });
    // A root no auto layout sizes is the size Figma draws it at, which Scrim's own overlay will
    // decide; allowed here, as that overlay would.
    for (const cell of ['width', 'height'])
      spec.style.root.base[cell].allowed = 'stand-in';
    // A stand-in for the slot table Scrim's own task will write.
    MUI_SLOTS.Scrim = { root: '&' };
    try {
      const { styles } = renderMuiComponent(spec, tokens);
      expect(styles.root.backgroundColor).toMatch(/^var\(--solar-color-/);
      expect(styles.appearances).toEqual({});
    } finally {
      delete MUI_SLOTS.Scrim;
    }
  });
});

describe('corners of their own', () => {
  it('writes each as its own border radius, and a none corner as radius.none', () => {
    const group = structuredClone(
      built.find((b) => b.spec.component === 'Button Group').spec,
    );
    group.style.root.appearance[
      'orientation=vertical, fullWidth=false'
    ].default = {
      radiusTopLeft: { token: 'radius.container' },
      radiusBottomLeft: { none: true },
    };
    const vertical = renderMuiComponent(group, tokens).styles.appearances[
      'orientation=vertical, fullWidth=false'
    ];
    expect(vertical.borderTopLeftRadius).toBe('var(--solar-radius-container)');
    expect(vertical.borderBottomLeftRadius).toBe('var(--solar-radius-none)');
  });
});

describe('a layer placed by position', () => {
  const group = structuredClone(
    built.find((b) => b.spec.component === 'Button Group').spec,
  );
  // Button Group's third button, as if Figma placed it by position.
  group.style.button3.base.x = { position: 4 };
  group.style.button3.base.y = { position: 6.5 };
  const { styles } = renderMuiComponent(group, tokens);

  it('is absolute at Figma’s position, and its parent positions it', () => {
    // Figma measures from the parent's outer edge, CSS from inside its border, which the parent
    // says (none here) and the child steps back by.
    expect(styles.root['& > *']).toMatchObject({
      position: 'absolute',
      left: 'calc(4px - var(--solar-placed-left, 0px))',
      top: 'calc(6.5px - var(--solar-placed-top, 0px))',
    });
    expect(styles.root.position).toBe('relative');
    expect(styles.root['--solar-placed-left']).toBe('0px');
  });

  it('keeps a shape’s position with its drawing, in the composition, not in CSS', () => {
    const spinner = built.find((b) => b.spec.component === 'Spinner').spec;
    const { styles: s, composition } = renderMuiComponent(spinner, tokens);
    expect(composition.indicator.base).toMatchObject({ x: 8, y: 1 });
    expect(JSON.stringify(s)).not.toContain('"left"');
  });
});
