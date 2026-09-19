import { describe, expect, it } from 'vitest';
import { buildIR } from '../src/build.js';
import { Diagnostics } from '../src/errors.js';
import type { MuiCatalog } from '../src/targets/mui/catalog.js';
import { TARGETS, targetIds } from '../src/targets/index.js';
import { muiPlugin } from '../src/targets/mui/index.js';
import type { MuiModel, MuiVariant } from '../src/targets/mui/model.js';
import type { GeneratedFile } from '../src/targets/plugin.js';
import { diffIR } from '../src/verify/ir-diff.js';
import { FIXTURE_MINI } from './helpers.js';
import { BTN_FILES, catalogFile, FX_CATALOG } from './mui-mapped-fixture.js';
import { twBuild, twContext, twRoot } from './tailwind-fixture.js';

function scopeFor(ir: ReturnType<typeof twBuild>['ir']) {
  return {
    components: Object.keys(ir.components).filter((n) =>
      muiPlugin.isMapped(ir.components[n]),
    ),
    ignored: (name: string) => muiPlugin.ignoredProperties(ir.components[name]),
  };
}

function generated(extra: Record<string, string> = {}) {
  const root = twRoot(extra);
  const { ir, config } = twBuild(root);
  const ctx = twContext(root, config);
  const files = muiPlugin.generate(ir, null, ctx, new Diagnostics());
  return { ir, ctx, files };
}

function generatedMapped() {
  const root = twRoot({ ...BTN_FILES, ...catalogFile() });
  const { ir, config } = twBuild(root);
  const ctx = twContext(root, config);
  const files = muiPlugin.generate(ir, FX_CATALOG, ctx, new Diagnostics());
  return { ir, ctx, files };
}

/** Re-serializes the model after `mutate` edited it in place. */
function tamper(
  files: GeneratedFile[],
  mutate: (model: MuiModel) => void,
): GeneratedFile[] {
  return files.map((f) => {
    if (f.path !== 'theme.model.json') {
      return f;
    }
    const model = JSON.parse(f.contents) as MuiModel;
    mutate(model);
    return { path: f.path, contents: `${JSON.stringify(model, null, 2)}\n` };
  });
}

function reparse(
  files: GeneratedFile[],
  ir: ReturnType<typeof twBuild>['ir'],
  catalog: MuiCatalog | null,
  ctx: ReturnType<typeof twContext>,
) {
  const diag = new Diagnostics();
  const reparsed = muiPlugin.reparse(files, ir, catalog, ctx, diag);
  return { diag, reparsed };
}

describe('mui round-trip', () => {
  it('is registered next to tailwind', () => {
    expect(targetIds()).toEqual(['mui', 'tailwind']);
    expect(TARGETS.mui).toBe(muiPlugin);
    expect(muiPlugin.id).toBe('mui');
  });

  it('reparses its own output to the source IR on the small fixture', () => {
    const { ir, ctx, files } = generated();
    const { diag, reparsed } = reparse(files, ir, null, ctx);
    expect(diag.items).toEqual([]);
    expect(reparsed).not.toBeNull();
    expect(diffIR(ir, reparsed!, scopeFor(ir))).toEqual([]);
    expect(reparsed!.tokens['color.text.default']).toMatchObject({
      modeInvariant: false,
      alias: { light: 'color.neutral.900' },
    });
    expect(reparsed!.tokens['shadow.focus'].$value).toEqual(
      ir.tokens['shadow.focus'].$value,
    );
    expect(reparsed!.components.pill).toBeUndefined();
    // the ignored property never appears in the generated output for the
    // component that ignores it (chip legitimately uses opacity, unignored)
    const model = JSON.parse(files[0].contents) as MuiModel;
    expect(JSON.stringify(model.themeOptions.components.FxTag)).not.toContain(
      'opacity',
    );
  });

  it('reparses the mini fixture (no mapped components) without differences', () => {
    const result = buildIR(FIXTURE_MINI);
    const ir = result.ir!;
    const ctx = {
      rootDir: FIXTURE_MINI,
      config: result.config!,
      compilerVersion: '0.0.0-test',
      outDir: `${FIXTURE_MINI}out`,
      allowCatalogMismatch: false,
    };
    const { diag, reparsed } = reparse(
      muiPlugin.generate(ir, null, ctx, new Diagnostics()),
      ir,
      null,
      ctx,
    );
    expect(diag.items).toEqual([]);
    expect(diffIR(ir, reparsed!, scopeFor(ir))).toEqual([]);
  });

  it('round-trips a component with two axes, three slots, five states, and combinations', () => {
    const { ir, ctx, files } = generated({
      'src/components/menu/menu.manifest.json': JSON.stringify({
        name: 'menu',
        displayName: 'Menu',
        baseline: false,
        axes: {
          tone: { values: ['quiet', 'loud'], default: 'quiet' },
          size: { values: ['sm', 'md'], default: 'md' },
        },
        states: ['hover', 'focus-visible', 'active', 'disabled', 'expanded'],
        slots: {
          root: { element: 'button' },
          label: { element: 'span' },
          icon: { element: 'span', optional: true },
          badge: { element: 'span', optional: true },
        },
        targets: { tailwind: {}, mui: {} },
      }),
      'src/components/menu/menu.css': [
        '.fx-menu {\n  display: inline-flex;\n  color: var(--fx-color-text-default);\n}',
        '.fx-menu:hover {\n  color: var(--fx-color-neutral-900);\n}',
        '.fx-menu:focus-visible {\n  box-shadow: var(--fx-shadow-focus);\n}',
        '.fx-menu:active:disabled {\n  opacity: 0.2;\n}',
        '.fx-menu[aria-expanded="true"] {\n  min-width: 44px;\n}',
        '.fx-menu[data-tone="loud"] {\n  padding: var(--fx-space-2);\n}',
        '.fx-menu[data-tone="loud"]:hover {\n  min-width: 48px;\n}',
        '.fx-menu[data-size="sm"][data-tone="loud"]:disabled .fx-menu__badge {\n  display: none;\n}',
        '.fx-menu .fx-menu__icon {\n  width: 20px;\n}',
        '.fx-menu[data-size="sm"] .fx-menu__icon {\n  width: 16px;\n}',
        '.fx-menu:hover .fx-menu__label {\n  opacity: 0.9;\n}',
        '',
      ].join('\n'),
    });
    const { diag, reparsed } = reparse(files, ir, null, ctx);
    expect(diag.items).toEqual([]);
    expect(diffIR(ir, reparsed!, scopeFor(ir))).toEqual([]);
    const model = JSON.parse(files[0].contents) as MuiModel;
    const keys = model.themeOptions.components.FxMenu.variants.map(
      (v) => Object.keys(v.style)[0],
    );
    expect(keys).toContain('&&&:disabled .FxMenu-badge');
    expect(keys).toContain('&&:hover');
    expect(keys).toContain('&:active:disabled');
  });

  it('round-trips a mode-varying alias token whose declaration is restated in every mode block', () => {
    const { ir, ctx, files } = generated({
      'src/tokens/color.css': [
        ':root {',
        '  --fx-color-neutral-900: #111111;',
        '  --fx-color-text-default: var(--fx-color-neutral-900);',
        '  --fx-color-brand-default: #222222;',
        '  --fx-color-on-brand-default: var(--fx-color-brand-default);',
        '}',
        ':root[data-fx-theme="dark"] {',
        '  --fx-color-text-default: #ffffff;',
        '  --fx-color-brand-default: #333333;',
        '  --fx-color-on-brand-default: var(--fx-color-brand-default);',
        '}',
        '',
      ].join('\n'),
    });
    const { diag, reparsed } = reparse(files, ir, null, ctx);
    expect(diag.items).toEqual([]);
    expect(diffIR(ir, reparsed!, scopeFor(ir))).toEqual([]);
  });

  describe('tamper matrix', () => {
    it('rejects reordered variants', () => {
      const { ir, ctx, files } = generated();
      const swapped = tamper(files, (m) => {
        const v = m.themeOptions.components.FxChip.variants;
        [v[0], v[1]] = [v[1], v[0]];
      });
      const { diag, reparsed } = reparse(swapped, ir, null, ctx);
      expect(reparsed).toBeNull();
      expect(diag.errors.map((d) => d.code)).toEqual(['DS-E081']);
      expect(diag.errors[0].message).toContain('canonical');
      expect(diag.errors[0].location).toEqual({
        file: 'theme.model.json',
        line: 1,
        column: 1,
      });
    });

    it('rejects a selector key with the wrong specificity', () => {
      const { ir, ctx, files } = generated();
      const flat = tamper(files, (m) => {
        const v = m.themeOptions.components.FxChip.variants[2];
        v.style = { '&': v.style['&&'] };
      });
      const { diag, reparsed } = reparse(flat, ir, null, ctx);
      expect(reparsed).toBeNull();
      expect(diag.errors[0].message).toContain('"&"');
      expect(diag.errors[0].message).toContain('"&&"');
    });

    it('rejects the wrong disabled form for the root element', () => {
      const { ir, ctx, files } = generated();
      const wrong = tamper(files, (m) => {
        const v = m.themeOptions.components.FxChip.variants[1];
        v.style = { '&[aria-disabled="true"]': v.style['&:disabled'] };
      });
      const { diag } = reparse(wrong, ir, null, ctx);
      expect(diag.errors.map((d) => d.code)).toEqual(['DS-E081']);
    });

    it('surfaces a changed value and a dropped rule as IR differences', () => {
      const { ir, ctx, files } = generated();
      const changed = tamper(files, (m) => {
        const chip = m.themeOptions.components.FxChip;
        chip.styleOverrides.root.display = 'flex';
        chip.variants.pop(); // the icon rule
      });
      const { diag, reparsed } = reparse(changed, ir, null, ctx);
      expect(diag.items).toEqual([]);
      const diffs = diffIR(ir, reparsed!, scopeFor(ir));
      // ruleDiffKey order: "icon" sorts before "root"
      expect(diffs.map((d) => d.id)).toEqual([
        'chip icon',
        'chip root display',
      ]);
    });

    it('rejects a theme entry for an excluded component and for an unknown one', () => {
      const { ir, ctx, files } = generated();
      const extra = tamper(files, (m) => {
        m.themeOptions.components.FxPill = {
          styleOverrides: { root: { display: 'block' } },
          variants: [],
        };
        m.components.pill = {
          ...m.components.tag,
          name: 'pill',
          exportName: 'Pill',
          themeKey: 'FxPill',
        };
        m.themeOptions.components.FxNope = {
          styleOverrides: { root: {} },
          variants: [],
        };
        m.components.nope = {
          ...m.components.tag,
          name: 'nope',
          exportName: 'Nope',
          themeKey: 'FxNope',
        };
      });
      const { diag, reparsed } = reparse(extra, ir, null, ctx);
      expect(reparsed).toBeNull();
      const messages = diag.errors.map((d) => d.message);
      expect(
        messages.some((m) => m.includes('"pill"') && m.includes('excluded')),
      ).toBe(true);
      expect(messages.some((m) => m.includes('FxNope'))).toBe(true);
    });

    it('rejects an unknown token variable, a token in the wrong section, and a foreign property', () => {
      const { ir, ctx, files } = generated();
      const bad = tamper(files, (m) => {
        m.themeOptions.components.FxChip.styleOverrides.root.color =
          'var(--fx-palette-primary-main)';
      });
      const badErrors = reparse(bad, ir, null, ctx).diag.errors;
      expect(badErrors.length).toBeGreaterThan(0);
      expect(badErrors.every((d) => d.code === 'DS-E081')).toBe(true);
      expect(badErrors[0].message).toContain('--fx-palette-primary-main');

      const misplaced = tamper(files, (m) => {
        m.themeOptions.tokens.color = { 'x-y': '#000000' };
      });
      expect(
        reparse(misplaced, ir, null, ctx).diag.errors[0].message,
      ).toContain('palette.tokens');

      const foreign = tamper(files, (m) => {
        m.themeOptions.components.FxChip.styleOverrides.root.colour = 'red';
      });
      const foreignMessage = reparse(foreign, ir, null, ctx).diag.errors[0]
        .message;
      expect(foreignMessage).toContain('colour');
      // a real parseComponentCss diagnostic keeps its own code and title wrapped inside the DS-E081
      expect(foreignMessage).toContain('DS-E040');
    });

    it('reports the exact message for a checkMeta failure, with no code wrapping', () => {
      const { ir, ctx, files } = generated();
      const scheme = tamper(files, (m) => {
        m.themeOptions.defaultColorScheme = 'dark';
      });
      const { diag } = reparse(scheme, ir, null, ctx);
      expect(diag.errors).toHaveLength(1);
      expect(diag.errors[0].code).toBe('DS-E081');
      expect(diag.errors[0].message).toBe(
        'mui: defaultColorScheme is "dark", expected "light"',
      );
    });

    it('reports the missing-file message when theme.model.json is absent', () => {
      const { ir, ctx, files } = generated();
      const missing = files.filter((f) => f.path !== 'theme.model.json');
      const { diag, reparsed } = reparse(missing, ir, null, ctx);
      expect(reparsed).toBeNull();
      expect(diag.errors).toHaveLength(1);
      expect(diag.errors[0].code).toBe('DS-E081');
      expect(diag.errors[0].message).toBe('mui: output lacks theme.model.json');
    });

    it('rejects component metadata that disagrees with the IR', () => {
      const { ir, ctx, files } = generated();

      const exportName = tamper(files, (m) => {
        m.components.chip.exportName = 'Nope';
      });
      expect(reparse(exportName, ir, null, ctx).diag.errors[0]).toMatchObject({
        code: 'DS-E081',
        message: expect.stringContaining(
          'component metadata differs from the IR (exportName)',
        ),
      });

      const rootElement = tamper(files, (m) => {
        m.components.chip.rootElement = 'span';
      });
      expect(reparse(rootElement, ir, null, ctx).diag.errors[0]).toMatchObject({
        code: 'DS-E081',
        message: expect.stringContaining(
          'component metadata differs from the IR (rootElement)',
        ),
      });

      const childrenSlot = tamper(files, (m) => {
        m.components.chip.childrenSlot = 'icon';
      });
      expect(reparse(childrenSlot, ir, null, ctx).diag.errors[0]).toMatchObject(
        {
          code: 'DS-E081',
          message: expect.stringContaining(
            'component metadata differs from the IR (childrenSlot)',
          ),
        },
      );

      const slotProp = tamper(files, (m) => {
        m.components.chip.slots.icon.prop = 'symbol';
      });
      expect(reparse(slotProp, ir, null, ctx).diag.errors[0]).toMatchObject({
        code: 'DS-E081',
        message: expect.stringContaining(
          'component metadata differs from the IR (slots)',
        ),
      });

      const axisValues = tamper(files, (m) => {
        m.components.chip.axes.tone.values = ['quiet'];
      });
      expect(reparse(axisValues, ir, null, ctx).diag.errors[0]).toMatchObject({
        code: 'DS-E081',
        message: expect.stringContaining(
          'component metadata differs from the IR (axes)',
        ),
      });
    });

    it('rejects a model that fails the schema, non-JSON, a wrong selector, and a wrong prefix', () => {
      const { ir, ctx, files } = generated();
      const schema = tamper(files, (m) => {
        (m as unknown as Record<string, unknown>).surprise = 1;
      });
      expect(reparse(schema, ir, null, ctx).diag.errors[0].message).toContain(
        'schema',
      );

      const broken = files.map((f) =>
        f.path === 'theme.model.json' ? { ...f, contents: '{' } : f,
      );
      expect(reparse(broken, ir, null, ctx).diag.errors[0].message).toContain(
        'valid JSON',
      );

      const selector = tamper(files, (m) => {
        m.themeOptions.cssVariables.colorSchemeSelector = 'class';
      });
      expect(reparse(selector, ir, null, ctx).diag.errors[0].message).toContain(
        'colorSchemeSelector',
      );

      const prefix = tamper(files, (m) => {
        m.themeOptions.cssVariables.cssVarPrefix = 'zz';
      });
      expect(reparse(prefix, ir, null, ctx).diag.errors[0].message).toContain(
        'cssVarPrefix',
      );
    });

    it('surfaces an added token as present only in the generated output', () => {
      const { ir, ctx, files } = generated();
      const added = tamper(files, (m) => {
        m.themeOptions.tokens.space['3'] = '12px';
        for (const scheme of Object.values(m.themeOptions.colorSchemes)) {
          scheme.palette.tokens['neutral-100'] = '#eeeeee';
        }
      });
      const { diag, reparsed } = reparse(added, ir, null, ctx);
      expect(diag.items).toEqual([]);
      expect(diffIR(ir, reparsed!, scopeFor(ir)).map((d) => d.id)).toEqual([
        'color.neutral.100',
        'space.3',
      ]);
    });
  });

  it('reports coverage per component', () => {
    const { ir } = generated();
    expect(muiPlugin.coverage(ir)).toEqual([
      { component: 'chip', target: 'mui', status: 'supported' },
      {
        component: 'pill',
        target: 'mui',
        status: 'excluded',
        reason: 'starter content',
      },
      {
        component: 'tag',
        target: 'mui',
        status: 'partial',
        ignored: ['opacity'],
      },
    ]);
  });
});

describe('mui round-trip: mapped components', () => {
  it('reparses the btn fixture to the source IR, resets excluded', () => {
    const { ir, ctx, files } = generatedMapped();
    const { diag, reparsed } = reparse(files, ir, FX_CATALOG, ctx);
    expect(diag.items).toEqual([]);
    expect(reparsed).not.toBeNull();
    expect(diffIR(ir, reparsed!, scopeFor(ir))).toEqual([]);
    expect(reparsed!.components.btn.rules).toHaveLength(
      ir.components.btn.rules.length,
    );
  });

  const MUI = (m: MuiModel) => m.themeOptions.components.MuiButton;

  // Every row here produces exactly one diagnostic: the mutated component
  // (`btn`/`MuiButton`, or `FxChip` for the own-component row) fails and is
  // skipped, while every other theme entry in the fixture round-trips
  // cleanly. Messages are pinned exactly (not `toContain`) so a change to
  // the wording is caught here.
  it.each<[string, (m: MuiModel) => void, string]>([
    [
      'a dropped reset',
      (m) => {
        MUI(m).variants.splice(0, 1);
      },
      'mui: btn: the leading 12 variants are not the resets computed from the catalog',
    ],
    [
      'an edited reset value',
      (m) => {
        (MUI(m).variants[0].style['&'] as Record<string, string>).minWidth =
          'unset';
      },
      'mui: btn: the leading 12 variants are not the resets computed from the catalog',
    ],
    [
      'reordered resets',
      (m) => {
        const v = MUI(m).variants;
        [v[0], v[1]] = [v[1], v[0]];
      },
      'mui: btn: the leading 12 variants are not the resets computed from the catalog',
    ],
    [
      'a missing parity default prop',
      (m) => {
        delete MUI(m).defaultProps!.disableRipple;
      },
      'mui: btn: defaultProps differ from the mapping',
    ],
    [
      'a design-system variant pointing at another MUI slot',
      (m) => {
        const v = MUI(m).variants[15];
        v.style = { '& .MuiButton-endIcon': v.style['& .MuiButton-startIcon'] };
      },
      'mui: MuiButton.variants[15] has a selector key "& .MuiButton-endIcon" that is not in the generated form',
    ],
    [
      'a media key outside the reset prefix',
      (m) => {
        const v = MUI(m).variants[12];
        v.style = { '@media print': v.style } as unknown as MuiVariant['style'];
      },
      'mui: MuiButton.variants[12] has a nested (media) key outside the reset prefix',
    ],
    [
      'tampered metadata',
      (m) => {
        m.components.btn.mapped!.resetCount = 3;
      },
      'mui: btn: component metadata differs from the IR (mapped.resetCount: 12 vs 3)',
    ],
    [
      'a wrong framework version',
      (m) => {
        m.framework.version = '9.9.9';
      },
      'mui: framework.version is "9.9.9", expected "9.4.0"',
    ],
    [
      'defaultProps on an own component',
      (m) => {
        m.themeOptions.components.FxChip.defaultProps = {
          disableRipple: true,
        };
      },
      'mui: chip: an own component has no defaultProps',
    ],
  ])('rejects %s with DS-E081', (_label, mutate, message) => {
    const { ir, ctx, files } = generatedMapped();
    const { diag, reparsed } = reparse(
      tamper(files, mutate),
      ir,
      FX_CATALOG,
      ctx,
    );
    expect(reparsed).toBeNull();
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E081']);
    expect(diag.errors[0].message).toBe(message);
  });

  it('fails when the catalog it is given differs from the one used to generate', () => {
    const { ir, ctx, files } = generatedMapped();
    const other = structuredClone(FX_CATALOG);
    other.components.btn.renders[0].rules[0].declarations['letter-spacing'] =
      '1px';
    const { diag, reparsed } = reparse(files, ir, other, ctx);
    expect(reparsed).toBeNull();
    expect(diag.errors[0].message).toContain(
      'the leading 12 variants are not the resets',
    );
  });

  it('fails when the catalog changes the reset count, naming both counts', () => {
    const { ir, ctx, files } = generatedMapped();
    const changed = structuredClone(FX_CATALOG);
    // BTN_RULES is the same array for both permutations in the fixture, so
    // structuredClone (which preserves shared references, unlike
    // JSON-round-tripping) keeps that sharing: pushing one rule here adds it
    // to both the quiet and loud renders, so the catalog now yields 14
    // resets instead of 12. `mapped.resetCount` (not a reset's content)
    // is what differs, and `firstDifferingKey` names it with both counts.
    changed.components.btn.renders[1].rules.push({
      media: null,
      selector: '&:focus-visible',
      declarations: { outline: '0' },
    });
    const { diag, reparsed } = reparse(files, ir, changed, ctx);
    expect(reparsed).toBeNull();
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E081']);
    expect(diag.errors[0].message).toBe(
      'mui: btn: component metadata differs from the IR (mapped.resetCount: 14 vs 12)',
    );
  });
});
