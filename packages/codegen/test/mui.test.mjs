import { describe, expect, it } from 'vitest';
import { buildTokenSpec, loadContract } from '../src/normalize/tokens.mjs';
import {
  MUI_PALETTE,
  MUI_TYPOGRAPHY,
  renderMui,
  solarPalettePath,
} from '../src/emit/mui.mjs';
import { flattenSpec } from '../src/spec.mjs';
import { camel } from '../src/util/naming.mjs';

const { spec } = buildTokenSpec(loadContract());
const { ts, manifest, data, deviations } = renderMui(spec);

describe('renderMui', () => {
  it('exposes every token per mode', () => {
    expect(data.tokens.light['color.surface.background']).toBe('#f5f5f5');
    expect(data.tokens.dark['color.surface.background']).toBe('#111111');
    expect(data.tokens.light['inset.md']).toBe('16px');
  });

  it('keeps both type modes, so the mobile sizes are not lost', () => {
    expect(data.typography.mobile['display.lg'].fontSize).toBe('40px');
    expect(data.typography.desktop['display.lg'].fontSize).toBe('56px');
  });

  it('keeps the viewport axis the theme map has no room for', () => {
    // solarTokens is keyed by theme mode, so both entries hold the Desktop size; without
    // solarViewportTokens the Mobile value would exist nowhere in the MUI output.
    expect(data.viewport.desktop['type.size.title.lg']).toBe('40px');
    expect(data.viewport.mobile['type.size.title.lg']).toBe('32px');
    expect(data.tokens.dark['type.size.title.lg']).toBe('40px');
  });

  it('exposes typography composites MUI can use directly', () => {
    expect(data.typography.desktop['label.md']).toMatchObject({
      fontFamily: '"Inter", "Open Sans", system-ui, sans-serif',
      fontWeight: 500,
      fontSize: '14px',
    });
  });

  it('emits letter spacing CSS can actually use', () => {
    // Figma states it as a percentage of the font size, which is not a valid CSS
    // letter-spacing: a browser drops the declaration outright. em is the same quantity and
    // stays correct when the Mobile scale changes the font size underneath it.
    const style = data.typography.desktop['display.lg'];
    expect(style.letterSpacing).toBe('-0.03em');
    for (const v of Object.values(data.typography.desktop))
      expect(String(v.letterSpacing)).not.toContain('%');
  });

  it('carries both viewports in one variant, the way createTheme reads them', () => {
    const style = data.responsiveTypography['title.lg'];
    expect(style.fontSize).toBe('40px');
    expect(style['@media (max-width: 767.98px)']).toEqual({
      fontSize: '32px',
      lineHeight: '40px',
    });
  });

  it('adds a media query only to the styles that actually change', () => {
    const withQuery = Object.values(data.responsiveTypography).filter((v) =>
      Object.keys(v).some((k) => k.startsWith('@media')),
    );
    expect(withQuery).toHaveLength(8);
    expect(data.responsiveTypography['body.md.regular']).not.toHaveProperty(
      '@media (max-width: 767.98px)',
    );
  });

  it('exposes the z-index ladder under MUI names', () => {
    expect(data.zIndex.dialog).toBe(400);
  });

  it('emits a TypeScript module with no MUI import', () => {
    expect(ts).not.toContain("from '@mui/material'");
    expect(ts).toContain('export const solarTokens');
    expect(ts).toContain('export const solarViewportTokens');
    expect(ts).toContain('export const solarResponsiveTypography');
    // SOLAR's styles by their variant names, then MUI's own variants on SOLAR styles.
    expect(ts).toContain(
      'typography: { ...solarMuiVariants, ...solarMuiTypography }',
    );
    expect(ts).toContain('export function createSolarThemeOptions');
  });

  it('paints MUI palette slots with SOLAR fills, never MUI defaults', () => {
    expect(data.palette.light.primary.main).toBe(
      data.tokens.light['color.action.primary.bg.default'],
    );
    expect(data.palette.dark.primary.main).toBe(
      data.tokens.dark['color.action.primary.bg.default'],
    );
    // MUI paints error.main as a contained button's background, so it is the danger fill, not
    // the danger text colour it used to be.
    expect(data.palette.light.error.main).toBe(
      data.tokens.light['color.action.primary.bg.danger.default'],
    );
    expect(data.palette.light.error.main).not.toBe(
      data.tokens.light['color.text.feedback.danger'],
    );
    expect(ts).toContain('light: { palette: solarMuiPalette.light }');
    expect(ts).toContain('dark: { palette: solarMuiPalette.dark }');
  });

  it('maps palette slots only to tokens that exist, and never to a text colour as a fill', () => {
    const walk = (node, path) =>
      Object.entries(node).flatMap(([k, v]) =>
        typeof v === 'string' ? [[`${path}.${k}`, v]] : walk(v, `${path}.${k}`),
      );
    for (const [slot, name] of walk(MUI_PALETTE, 'palette')) {
      expect(data.tokens.light, slot).toHaveProperty([name]);
      if (slot.endsWith('.main'))
        expect(name, slot).not.toMatch(/^color\.text\./);
    }
  });

  it("gives MUI's own variants SOLAR type, so stock components are not Roboto", () => {
    expect(data.muiTypography.fontFamily).toBe(
      '"Inter", "Open Sans", system-ui, sans-serif',
    );
    expect(data.muiTypography.body1).toEqual(
      data.responsiveTypography['body.md.regular'],
    );
    expect(data.muiTypography.h1).toEqual(
      data.responsiveTypography['display.lg'],
    );
    // A responsive style keeps its media query when it becomes an MUI variant.
    expect(data.muiTypography.h4).toHaveProperty(
      '@media (max-width: 767.98px)',
    );
    expect(data.muiTypography.button).toMatchObject({
      fontSize: '14px',
      textTransform: 'none',
    });
  });

  it('reports the MUI mapping as a deviation, because SOLAR does not define it', () => {
    expect(deviations.map((d) => d.token)).toEqual(['mui.theme']);
  });

  it('covers the same token names as the manifest', () => {
    expect(Object.keys(manifest)).toContain('color.action.primary.bg.hover');
  });
});

describe('the MUI theme created from createSolarThemeOptions', async () => {
  // The generated module itself, as an app loads it, under MUI's own createTheme.
  const { createTheme } = await import('@mui/material/styles');
  const { createSolarThemeOptions } =
    await import('../../styles/src/generated/mui/theme.ts');
  const theme = createTheme(createSolarThemeOptions());
  // One object per selector, merged: MUI may emit a selector twice (native colour mode adds a
  // second, small :root sheet), and a plain Object.assign would keep only the last of them.
  const sheets = {};
  for (const sheet of theme.generateStyleSheets())
    for (const [selector, vars] of Object.entries(sheet))
      sheets[selector] = { ...sheets[selector], ...vars };

  it('switches Dark by the attribute the tokens switch on, one scheme each', () => {
    expect(Object.keys(sheets)).toContain('[data-theme="dark"]');
    expect(
      sheets['[data-theme="dark"]']['--mui-palette-background-paper'],
    ).toBe(data.tokens.dark['color.surface.base']);
    expect(
      sheets[':root, [data-theme="light"]']['--mui-palette-background-paper'],
    ).toBe(data.tokens.light['color.surface.base']);
  });

  it('breaks where SOLAR’s Mobile type does, from the viewport tokens', () => {
    expect(theme.breakpoints.values).toEqual({
      xs: 0,
      sm: 768,
      md: 1024,
      lg: 1440,
      xl: 1920,
    });
    // MUI's down('sm') is the width below which the type is Mobile.
    expect(theme.breakpoints.down('sm')).toContain('max-width:767.95px');
    expect(ts).toContain('@media (max-width: 767.98px)');
  });

  it('gives SOLAR’s colours as CSS variables in both schemes, for sx palette paths', () => {
    expect(
      sheets[':root, [data-theme="light"]']['--mui-palette-surface-raised'],
    ).toBe(data.tokens.light['color.surface.raised']);
    expect(sheets['[data-theme="dark"]']['--mui-palette-surface-raised']).toBe(
      data.tokens.dark['color.surface.raised'],
    );
    expect(theme.vars.palette.text.feedback.danger).toMatch(
      /^var\(--mui-palette-text-feedback-danger, /,
    );
  });

  it('gives Typography SOLAR’s variants and their elements', () => {
    expect(theme.typography.titleSm).toEqual(data.variants.titleSm);
    expect(theme.typography['title.sm']).toBeUndefined();
    const mapping = theme.components.MuiTypography.defaultProps.variantMapping;
    expect(mapping.titleSm).toBe('h6');
    expect(mapping.h1).toBe('h1');
    expect(mapping.body1).toBe('p');
  });

  it('works alpha() on a SOLAR colour, in MUI’s native colour mode', () => {
    // Without nativeColor, MUI's alpha() reads a channel variable it defines only for its own
    // colours, and draws nothing on a SOLAR group (test/mui-app-code.test.mjs).
    expect(theme.alpha(theme.vars.palette.surface.raised, 0.3)).toMatch(
      /^oklch\(from var\(--mui-palette-surface-raised, #[0-9a-f]{6}\) l c h \/ 0\.3\)$/,
    );
  });

  it('spaces by SOLAR’s smallest inset, and moves at SOLAR’s speeds', () => {
    // In MUI's CSS-variables mode spacing() is a calc() over --mui-spacing, SOLAR's 4px.
    expect(sheets[':root']['--mui-spacing']).toBe(
      data.tokens.light['inset.2xs'],
    );
    expect(theme.spacing(4)).toBe('calc(4 * var(--mui-spacing, 4px))');
    expect(theme.transitions.duration.standard).toBe(300);
    expect(theme.transitions.easing.easeOut).toBe(
      data.tokens.light['motion.ease.out'],
    );
  });
});

// SOLAR in app code (packages/components/README.md, SOLAR in app code): an app writes
// SOLAR's colours as MUI palette paths, `sx={{ bgcolor: 'surface.raised' }}`, so the palette holds
// every semantic colour under SOLAR's own structure, and no primitive, which SOLAR bans in components.
describe('the palette’s SOLAR groups', () => {
  const semantic = flattenSpec(spec).filter(
    (t) => t.name.startsWith('color.') && t.ext?.tier === 'semantic',
  );
  const names = semantic.map((t) => t.name);
  const at = (obj, path) => path.reduce((o, k) => o?.[k], obj);

  it('holds every semantic colour, at its camelCase path, in both schemes', () => {
    expect(semantic.length).toBe(287);
    for (const t of semantic) {
      const path = solarPalettePath(t.name, names);
      expect(at(data.palette.light, path), t.name).toBe(
        data.tokens.light[t.name],
      );
      expect(at(data.palette.dark, path), t.name).toBe(
        data.tokens.dark[t.name],
      );
    }
    expect(data.palette.light.surface.feedback.danger.subtleAlpha).toBe(
      data.tokens.light['color.surface.feedback.danger.subtle-alpha'],
    );
  });

  it('holds no primitive', () => {
    for (const group of ['red', 'neutral', 'alpha', 'mono', 'flowAccent'])
      expect(data.palette.light[group], group).toBeUndefined();
    expect(data.palette.light.brand.red).toBeUndefined();
    expect(data.palette.light.brand.primary).toBe(
      data.tokens.light['color.brand.primary'],
    );
  });

  it('gives a colour that is also a group its own colour as main', () => {
    expect(solarPalettePath('color.border.inverse', names)).toEqual([
      'border',
      'inverse',
      'main',
    ]);
    expect(data.palette.light.border.inverse.main).toBe(
      data.tokens.light['color.border.inverse'],
    );
    expect(data.palette.light.border.inverse.subtle).toBe(
      data.tokens.light['color.border.inverse.subtle'],
    );
  });

  it('keeps MUI’s own slots beside SOLAR’s in the groups they share', () => {
    expect(data.palette.light.text.secondary).toBe(
      data.tokens.light['color.text.secondary'],
    );
    expect(data.palette.light.text.tertiary).toBe(
      data.tokens.light['color.text.tertiary'],
    );
    expect(data.palette.light.action.disabledBackground).toBe(
      data.tokens.light['color.action.primary.bg.disabled'],
    );
    expect(data.palette.light.action.primary.bg.hover).toBe(
      data.tokens.light['color.action.primary.bg.hover'],
    );
    // MUI's primary stays MUI's shape (main, dark, contrastText), SOLAR's action.primary beside it.
    expect(data.palette.light.primary.main).toBe(
      data.tokens.light['color.action.primary.bg.default'],
    );
  });
});

// SOLAR in app code: every SOLAR text style is a Typography variant under its camelCase name
// (`<Typography variant="titleSm">`), each with a default element. The headings follow MUI's own
// variants, so `variant="h4"` and `variant="titleLg"` are one style on one element.
describe('the theme’s typography variants', () => {
  const { themeTs } = renderMui(spec);
  const styles = Object.keys(data.responsiveTypography);

  it('is every SOLAR text style, under its camelCase name', () => {
    expect(styles.length).toBe(47);
    for (const style of styles)
      expect(data.variants[camel(style)], style).toEqual(
        data.responsiveTypography[style],
      );
    expect(Object.keys(data.variants).length).toBe(47);
  });

  it('keeps MUI’s own variants on their SOLAR styles', () => {
    expect(data.muiTypography.h4).toEqual(
      data.responsiveTypography['title.lg'],
    );
    expect(data.muiTypography.body1).toEqual(
      data.responsiveTypography['body.md.regular'],
    );
  });

  it('gives every variant a default element, the headings as MUI’s own', () => {
    for (const style of styles)
      expect(data.variantMapping[camel(style)], style).toMatch(
        /^(h[1-6]|p|span|code)$/,
      );
    for (const [variant, style] of Object.entries(MUI_TYPOGRAPHY).filter(
      ([v]) => /^h[1-6]$/.test(v),
    ))
      expect(data.variantMapping[camel(style)], style).toBe(variant);
    expect(data.variantMapping.titleSm).toBe('h6');
    expect(data.variantMapping.titleXs).toBe('h6');
    expect(data.variantMapping.bodyMdRegular).toBe('p');
    expect(data.variantMapping.labelMd).toBe('span');
    expect(data.variantMapping.codeMd).toBe('code');
  });

  it('keys no variant by a dotted name, which MUI would put in a class name', () => {
    expect(themeTs).not.toContain('...solarResponsiveTypography');
    expect(themeTs).toContain('solarMuiVariants');
  });
});

// The types that make SOLAR in app code typecheck: every SOLAR palette path and variant, and none of
// MUI's own text slots restated (test/types/app-code.tsx in @bwp-web/components proves it compiles,
// and that an invented name does not).
describe('the type augmentation', () => {
  const { augmentationTs } = renderMui(spec);
  const leafPaths = (node, prefix = []) =>
    Object.entries(node).flatMap(([key, value]) =>
      typeof value === 'string'
        ? [[...prefix, key]]
        : leafPaths(value, [...prefix, key]),
    );

  it('names every SOLAR palette leaf', () => {
    const paths = leafPaths(data.solarPalette);
    expect(paths.length).toBe(287);
    for (const path of paths) {
      const key = path.at(-1);
      expect(augmentationTs, path.join('.')).toMatch(
        new RegExp(`\\b'?${key}'?\\??: string;`),
      );
    }
  });

  it('names every variant, and makes each a Typography variant', () => {
    for (const name of Object.keys(data.variants)) {
      expect(augmentationTs).toContain(`    ${name}: CSSProperties;`);
      expect(augmentationTs).toContain(`    ${name}: true;`);
    }
  });

  it('adds SOLAR’s text roles beside MUI’s, and restates none of MUI’s', () => {
    const typeText = augmentationTs.match(
      /interface TypeText \{([\s\S]*?)\n {2}\}/,
    )[1];
    expect(typeText).toContain('tertiary: string;');
    expect(typeText).toContain('feedback: {');
    expect(typeText).not.toMatch(/^ {4}(primary|secondary|disabled):/m);
  });
});
