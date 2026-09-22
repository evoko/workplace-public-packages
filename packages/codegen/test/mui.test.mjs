import { describe, expect, it } from 'vitest';
import { buildTokenSpec, loadContract } from '../src/normalize/tokens.mjs';
import { renderMui } from '../src/emit/mui.mjs';

const { spec } = buildTokenSpec(loadContract());
const { ts, manifest, data } = renderMui(spec);

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

  it('exposes the z-index ladder under MUI names', () => {
    expect(data.zIndex.dialog).toBe(400);
  });

  it('emits a TypeScript module with no MUI import', () => {
    expect(ts).not.toContain("from '@mui/material'");
    expect(ts).toContain('export const solarTokens');
    expect(ts).toContain('export const solarViewportTokens');
    expect(ts).toContain('export function createSolarThemeOptions');
  });

  it('covers the same token names as the manifest', () => {
    expect(Object.keys(manifest)).toContain('color.action.primary.bg.hover');
  });
});
