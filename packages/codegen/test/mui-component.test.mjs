import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { buildTokenSpec, loadContract } from '../src/normalize/tokens.mjs';
import { renderMuiComponent, MUI_SLOTS } from '../src/emit/mui-component.mjs';
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
    for (const [at, value] of leaves(styles)) {
      const ok =
        /^var\(--solar-[a-z0-9-]+\)$/.test(value) ||
        KEYWORDS.has(value) ||
        allowed.has(value) ||
        /^-?[\d.]+em$/.test(value); // letter spacing, derived from the text style token
      expect(ok, `${at}: ${value}`).toBe(true);
    }
  });

  it('has the three sizes, with md as the base', () => {
    expect(Object.keys(styles.sizes)).toEqual(['sm', 'xl']);
    expect(styles.sizes.sm.paddingLeft).toBe('var(--solar-inset-xs)');
    expect(styles.sizes.xl.borderRadius).toBe('var(--solar-radius-none)');
    expect(styles.sizes.xl.justifyContent).toBe('space-between');
  });

  it('draws xl flat, as Figma does: no appearance of xl inherits the base shadow', () => {
    expect(styles.root.boxShadow).toBe('var(--solar-shadow-control)');
    for (const [combo, style] of Object.entries(styles.combined.xl))
      expect(style.boxShadow, combo).toBe('none');
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
    // The shadow follows size too (xl is flat), so it sits in the per-size section.
    expect(
      styles.combined.md['variant=primary, danger=false']['&.Mui-focusVisible']
        .boxShadow,
    ).toBe('var(--solar-shadow-focus-default)');
  });

  it('renders disabled and loading as the classes MUI sets for those props', () => {
    expect(primary['&.Mui-disabled'].backgroundColor).toBe(
      'var(--solar-color-action-primary-bg-disabled)',
    );
    expect(primary).toHaveProperty(['&.MuiButton-loading']);
  });

  it('puts disabled after hover, so it wins at equal specificity, as CSS order decides', () => {
    const keys = Object.keys(primary);
    expect(keys.indexOf('&.Mui-disabled')).toBeGreaterThan(
      keys.indexOf('&:hover'),
    );
    expect(keys.indexOf('&.Mui-disabled')).toBeGreaterThan(
      keys.indexOf('&:active'),
    );
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
    expect(ts).toContain("export type SolarButtonSize = 'md' | 'sm' | 'xl';");
    expect(ts).toMatch(/danger\?: boolean;/);
    expect(ts).toMatch(/disabled\?: boolean;/);
    expect(ts).toMatch(/loading\?: boolean;/);
    expect(ts).not.toMatch(/hover\?:/);
    expect(ts).not.toMatch(/from '@mui/);
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
