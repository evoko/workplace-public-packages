import { describe, expect, it } from 'vitest';
import { buildTokenSpec, loadContract } from '../src/normalize/tokens.mjs';
import { MUI_PALETTE, renderMui } from '../src/emit/mui.mjs';

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
      fontFamily: 'Inter',
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
    expect(ts).toContain(
      'typography: { ...solarResponsiveTypography, ...solarMuiTypography }',
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
    expect(ts).toContain('palette: { mode, ...solarMuiPalette[mode] }');
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
    expect(data.muiTypography.fontFamily).toBe('Inter');
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
