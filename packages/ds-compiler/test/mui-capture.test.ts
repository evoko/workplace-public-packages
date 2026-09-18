import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { Diagnostics } from '../src/errors.js';
import { captureMuiDefaults } from '../src/targets/mui/capture.js';
import {
  installedMuiVersion,
  type MuiCatalog,
} from '../src/targets/mui/catalog.js';
import { BTN_FILES } from './mui-mapped-fixture.js';
import { twBuild, twContext, twRoot } from './tailwind-fixture.js';

const REAL_OUT_DIR = fileURLToPath(
  new URL('../../styles-mui/src/generated/', import.meta.url),
);

function manifest(extra: Record<string, unknown>): string {
  return JSON.stringify({ displayName: 'X', baseline: false, ...extra });
}

/**
 * A `div`-rooted component named `name`, mapped onto Chip with an axis onto
 * `variant` and `icon`/`label` slots; `disabled` is written as
 * `[aria-disabled="true"]` (Chip's root is not a form control). `clickable`
 * decides whether Chip's root is a ButtonBase for this mapping.
 */
function chipFixture(name: string, clickable: boolean): Record<string, string> {
  return {
    [`src/components/${name}/${name}.manifest.json`]: manifest({
      name,
      displayName: name,
      axes: { tone: { values: ['filled', 'outlined'], default: 'filled' } },
      states: ['disabled'],
      slots: {
        root: { element: 'div' },
        icon: { element: 'span', optional: true },
        label: { element: 'span' },
      },
      targets: {
        tailwind: {},
        mui: {
          component: 'Chip',
          axisMap: { tone: 'variant' },
          slotMap: { icon: 'icon', label: 'label' },
          defaultProps: clickable ? { clickable: true } : {},
        },
      },
    }),
    [`src/components/${name}/${name}.css`]: [
      `.fx-${name} {`,
      '  display: inline-flex;',
      '  padding: var(--fx-space-2);',
      '  color: var(--fx-color-text-default);',
      '  font-family: var(--fx-font-family-body);',
      '}',
      `.fx-${name}[aria-disabled="true"] {`,
      '  cursor: not-allowed;',
      '}',
      `.fx-${name}[data-tone="outlined"] {`,
      '  cursor: pointer;',
      '}',
      `.fx-${name} .fx-${name}__icon {`,
      '  width: 20px;',
      '}',
      `.fx-${name} .fx-${name}__label {`,
      '  width: 20px;',
      '}',
      '',
    ].join('\n'),
  };
}

async function capture(files: Record<string, string>) {
  const root = twRoot(files);
  const { ir, config } = twBuild(root);
  const ctx = { ...twContext(root, config), outDir: REAL_OUT_DIR };
  const diag = new Diagnostics();
  const captured = await captureMuiDefaults(ir, ctx, diag);
  const catalog = captured
    ? (JSON.parse(captured.contents) as MuiCatalog)
    : null;
  return { root, captured, catalog, diag };
}

describe('captureMuiDefaults (installed @mui/material)', () => {
  it('captures Button for the btn fixture', async () => {
    const { root, captured, catalog, diag } = await capture(BTN_FILES);
    expect(diag.errors).toEqual([]);
    expect(captured?.path).toBe(`${root}/catalogs/mui.json`);
    expect(captured?.contents.endsWith('\n')).toBe(true);
    expect(catalog!.framework).toEqual({
      name: '@mui/material',
      version: installedMuiVersion(REAL_OUT_DIR),
    });
    expect(catalog!.generated).toMatch(
      /^Captured by @bwp-web\/ds-compiler 0\.0\.0-test for target mui from @mui\/material 9\.4\.\d+\./,
    );

    const button = catalog!.frameworkComponents.Button;
    expect(button.themeKey).toBe('MuiButton');
    expect(button.classes.root).toBe('MuiButton-root');
    expect(button.classes.startIcon).toBe('MuiButton-startIcon');
    expect(button.props.variant.values).toEqual([
      'text',
      'outlined',
      'contained',
    ]);
    expect(button.props.disableRipple.kind).toBe('other');

    const btn = catalog!.components.btn;
    expect(btn.component).toBe('Button');
    expect(btn.rootElement).toBe('button');
    expect(btn.buttonBase).toBe(true);
    expect(btn.axisMap).toEqual({ tone: 'variant' });
    expect(btn.slotMap).toEqual({ icon: 'startIcon' });
    expect(btn.defaultProps).toEqual({
      disableElevation: true,
      disableFocusRipple: true,
      disableRipple: true,
      disableTouchRipple: true,
      focusRipple: false,
      variant: 'quiet',
    });
    expect(btn.renders.map((r) => r.axes)).toEqual([
      { tone: 'quiet' },
      { tone: 'loud' },
    ]);

    const rules = btn.renders[0].rules;
    const find = (selector: string, media: string | null = null) =>
      rules.find((r) => r.selector === selector && r.media === media);
    const base = find('&')!;
    expect(base.declarations['min-width']).toBe('64px');
    expect(base.declarations['text-transform']).toBe('uppercase');
    expect(base.declarations.color).toBe('inherit'); // ButtonBase, merged into the root class
    expect(base.declarations['-webkit-tap-highlight-color']).toBe(
      'transparent',
    );
    expect(find('&:hover')!.declarations['text-decoration']).toBe('none');
    expect(find('&.Mui-disabled')!.declarations['pointer-events']).toBe('none');
    expect(
      find('&:hover', '(hover: hover)')!.declarations['--variant-containedBg'],
    ).toBeDefined();
    expect(find('& .MuiButton-startIcon')!.declarations['margin-right']).toBe(
      '8px',
    );
    expect(find('& .MuiButton-startIcon::before')!.declarations.content).toBe(
      '"\\200b"',
    );
    expect(find('&::-moz-focus-inner')!.declarations['border-style']).toBe(
      'none',
    );
    expect(find('&', 'print')!.declarations['color-adjust']).toBe('exact');
    for (const rule of rules) {
      expect(rule.selector).toMatch(/^&/);
      expect(rule.selector).not.toMatch(/\bc-[a-z0-9]/);
      expect(JSON.stringify(rule)).not.toContain('TouchRipple');
    }
  });

  it('is deterministic', async () => {
    const a = await capture(BTN_FILES);
    const b = await capture(BTN_FILES);
    expect(a.captured!.contents).toBe(b.captured!.contents);
  });

  it('reports DS-E086 for an MUI element no slot maps', async () => {
    const files = { ...BTN_FILES };
    const m = JSON.parse(files['src/components/btn/btn.manifest.json']) as {
      slots: { root: { element: string } };
      targets: { mui: Record<string, unknown> };
    };
    m.slots.root.element = 'div';
    m.targets.mui = {
      component: 'Chip',
      axisMap: { tone: 'variant' },
      slotMap: { icon: 'icon' },
    };
    files['src/components/btn/btn.manifest.json'] = JSON.stringify(m);
    files['src/components/btn/btn.css'] = files[
      'src/components/btn/btn.css'
    ].replace('.fx-btn:disabled', '.fx-btn[aria-disabled="true"]');
    const { captured, diag } = await capture(files);
    expect(captured).toBeNull();
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E086']);
    expect(diag.errors[0].message).toContain('MuiChip-label');
    expect(diag.errors[0].message).toContain('no slot maps');
    expect(diag.errors[0].location?.file).toBe(
      'src/components/btn/btn.manifest.json',
    );
  });

  it('reports DS-E086 when the MUI component cannot be loaded', async () => {
    const files = { ...BTN_FILES };
    const m = JSON.parse(files['src/components/btn/btn.manifest.json']) as {
      targets: { mui: Record<string, unknown> };
    };
    m.targets.mui = {
      component: 'Nope',
      axisMap: { tone: 'variant' },
      slotMap: { icon: 'startIcon' },
    };
    files['src/components/btn/btn.manifest.json'] = JSON.stringify(m);
    const { captured, diag } = await capture(files);
    expect(captured).toBeNull();
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E086']);
    expect(diag.errors[0].message).toContain('@mui/material/Nope');
  });

  it('reports DS-E086 when neither <Component>OwnProps nor <Component>Props is an interface', async () => {
    const files = { ...BTN_FILES };
    const m = JSON.parse(files['src/components/btn/btn.manifest.json']) as {
      targets: { mui: Record<string, unknown> };
    };
    // TextFieldProps is a conditional `type`, not an `interface`, and there
    // is no TextFieldOwnProps either.
    m.targets.mui = {
      component: 'TextField',
      axisMap: { tone: 'variant' },
      slotMap: { icon: 'startIcon' },
    };
    files['src/components/btn/btn.manifest.json'] = JSON.stringify(m);
    const { captured, diag } = await capture(files);
    expect(captured).toBeNull();
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E086']);
    expect(diag.errors[0].message).toContain(
      'cannot find an interface TextFieldOwnProps or TextFieldProps in',
    );
    expect(diag.errors[0].message).toContain('TextField.d.ts');
  });

  it('reports DS-E086 (threw while rendering) when the probe render throws, never a thrown error', async () => {
    const files = { ...BTN_FILES };
    const m = JSON.parse(files['src/components/btn/btn.manifest.json']) as {
      slots: { root: { element: string } };
      targets: { mui: Record<string, unknown> };
    };
    // MenuItem requires a surrounding Menu/MenuList context and throws
    // without one, even with no other props set.
    m.slots.root.element = 'li';
    m.targets.mui = {
      component: 'MenuItem',
      axisMap: { tone: 'variant' },
      slotMap: { icon: 'startIcon' },
    };
    files['src/components/btn/btn.manifest.json'] = JSON.stringify(m);
    const { captured, diag } = await capture(files);
    expect(captured).toBeNull();
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E086']);
    expect(diag.errors[0].message).toContain('threw while rendering');
    expect(diag.errors[0].message).toContain('MenuListContext');
  });

  it('reports DS-E086 when a mapped component renders different root elements across axis permutations', async () => {
    const files = { ...BTN_FILES };
    const m = JSON.parse(files['src/components/btn/btn.manifest.json']) as {
      slots: Record<string, unknown>;
      axes: Record<string, unknown>;
      states: string[];
      targets: { mui: Record<string, unknown> };
    };
    // Typography's probe (no variant set) defaults to "body1" and renders a
    // <p>; "h1" renders an <h1>. The manifest's root element ("p") matches
    // the probe, so planMapping accepts it, but the permutation renders
    // disagree with each other.
    m.slots = { root: { element: 'p' } };
    m.axes = { tone: { values: ['body1', 'h1'], default: 'body1' } };
    m.states = [];
    m.targets.mui = {
      component: 'Typography',
      axisMap: { tone: 'variant' },
      slotMap: {},
    };
    files['src/components/btn/btn.manifest.json'] = JSON.stringify(m);
    files['src/components/btn/btn.css'] = [
      '.fx-btn {',
      '  display: inline-flex;',
      '  color: var(--fx-color-text-default);',
      '}',
      '.fx-btn[data-tone="h1"] {',
      '  color: var(--fx-color-text-default);',
      '}',
      '',
    ].join('\n');
    const { captured, diag } = await capture(files);
    expect(captured).toBeNull();
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E086']);
    expect(diag.errors[0].message).toContain(
      'renders different root elements depending on its props (without axis props: p; with axis values: p, h1); it cannot be mapped',
    );
  });

  it('computes buttonBase and the ripple parity props per mapping (not per MUI component), independent of processing order', async () => {
    async function run(plainName: string, clickName: string) {
      const files = {
        ...chipFixture(plainName, false),
        ...chipFixture(clickName, true),
      };
      const { catalog, diag } = await capture(files);
      expect(diag.errors).toEqual([]);
      expect(catalog!.components[plainName].buttonBase).toBe(false);
      expect(catalog!.components[plainName].defaultProps).toEqual({
        variant: 'filled',
      });
      expect(catalog!.components[clickName].buttonBase).toBe(true);
      // Exactly disableRipple, disableTouchRipple, focusRipple, clickable,
      // and the variant axis default: no disableFocusRipple (Button's own
      // prop, not ButtonBase's) and no React "does not recognize" warning
      // (which would otherwise show up as a DS-E086 above).
      expect(catalog!.components[clickName].defaultProps).toEqual({
        clickable: true,
        disableRipple: true,
        disableTouchRipple: true,
        focusRipple: false,
        variant: 'filled',
      });
    }
    // Both orders: the plain mapping processed before the clickable one,
    // and after it, so a stale cache keyed only by the MUI component name
    // cannot silently pass by processing order.
    await run('aaplain', 'zzclick');
    await run('zzplain', 'aaclick');
  });

  it('reports DS-E086 when the runtime cannot be resolved from the outDir', async () => {
    const root = twRoot(BTN_FILES);
    const { ir, config } = twBuild(root);
    const diag = new Diagnostics();
    expect(
      await captureMuiDefaults(ir, twContext(root, config), diag),
    ).toBeNull();
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E086']);
    expect(diag.errors[0].message).toContain('cannot load');
  });

  it('captures an empty catalog with the framework version when nothing is mapped', async () => {
    const { catalog, diag } = await capture({});
    expect(diag.errors).toEqual([]);
    expect(catalog!.components).toEqual({});
    expect(catalog!.frameworkComponents).toEqual({});
    expect(catalog!.framework.version).toMatch(/^9\.4\./);
  });
});
