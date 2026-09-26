import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { describe, expect, it } from 'vitest';

// What SOLAR in app code relies on in MUI (packages/components/README.md, SOLAR in app code):
// in CSS-variables mode a custom, nested palette group becomes CSS variables, an sx palette path
// resolves to them (so it follows data-theme), and in MUI's native colour mode theme.alpha() works on
// any of them. In MUI's default mode alpha() reads a channel variable MUI defines only for its own
// colours (info.mainChannel), none for a custom group, and draws nothing: the SOLAR theme sets
// nativeColor for that. An MUI upgrade that changes any of this fails here, before an app notices.
const theme = createTheme({
  cssVariables: { colorSchemeSelector: '[data-theme="%s"]', nativeColor: true },
  colorSchemes: {
    light: {
      palette: {
        surface: {
          raised: '#ffffff',
          feedback: { info: { subtleAlpha: '#e8f0fe' } },
        },
      },
    },
    dark: {
      palette: {
        surface: {
          raised: '#222222',
          feedback: { info: { subtleAlpha: '#1a2233' } },
        },
      },
    },
  },
});

describe('MUI, as SOLAR in app code uses it', () => {
  it('makes a nested custom palette group CSS variables', () => {
    // Each with Light's value as its fallback, where no colour scheme is set.
    expect(theme.vars.palette.surface.raised).toBe(
      'var(--mui-palette-surface-raised, #ffffff)',
    );
    expect(theme.vars.palette.surface.feedback.info.subtleAlpha).toBe(
      'var(--mui-palette-surface-feedback-info-subtleAlpha, #e8f0fe)',
    );
  });

  it('resolves an sx palette path to the variable', () => {
    const html = renderToString(
      h(
        ThemeProvider,
        { theme },
        h(Box, {
          sx: {
            bgcolor: 'surface.raised',
            color: 'surface.feedback.info.subtleAlpha',
          },
        }),
      ),
    );
    expect(html).toContain(
      'background-color:var(--mui-palette-surface-raised)',
    );
    expect(html).toContain(
      'color:var(--mui-palette-surface-feedback-info-subtleAlpha)',
    );
  });

  it('gives alpha() on a custom group’s variable as CSS’s relative colour, in native colour mode', () => {
    expect(theme.alpha(theme.vars.palette.surface.raised, 0.3)).toBe(
      'oklch(from var(--mui-palette-surface-raised, #ffffff) l c h / 0.3)',
    );
  });
});
