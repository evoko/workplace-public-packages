import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { createElement as h } from 'react';
import { useTheme } from '@mui/material/styles';
import { Button, SolarProvider } from '../src/index.ts';

// What the theme a component sees under the provider holds.
function Probe({ read }) {
  read(useTheme());
  return null;
}

describe('SolarProvider', () => {
  it('renders a component with no other setup', () => {
    const html = renderToString(
      h(SolarProvider, null, h(Button, null, 'Continue')),
    );
    expect(html).toContain('Continue');
  });

  it('gives stock MUI SOLAR’s theme, both schemes switched by data-theme', () => {
    let theme;
    renderToString(
      h(SolarProvider, null, h(Probe, { read: (t) => (theme = t) })),
    );
    expect(theme.breakpoints.values.sm).toBe(768);
    expect(theme.getColorSchemeSelector('dark')).toBe('[data-theme="dark"] &');
    expect(theme.colorSchemes.dark.palette.background.paper).not.toBe(
      theme.colorSchemes.light.palette.background.paper,
    );
  });

  it('merges the app’s own options over SOLAR’s', () => {
    let theme;
    renderToString(
      h(
        SolarProvider,
        { theme: { shape: { borderRadius: 2 } } },
        h(Probe, { read: (t) => (theme = t) }),
      ),
    );
    expect(theme.shape.borderRadius).toBe(2);
    expect(theme.breakpoints.values.sm).toBe(768);
  });
});

describe('a SOLAR component in the MUI theme', () => {
  it('takes the theme’s defaultProps where the caller leaves a prop unset', () => {
    const theme = {
      components: { SolarButton: { defaultProps: { disabled: true } } },
    };
    const themed = renderToString(
      h(SolarProvider, { theme }, h(Button, null, 'Continue')),
    );
    expect(themed).toMatch(/<button[^>]*disabled=""/);
    // The caller's own prop wins over the theme's.
    const own = renderToString(
      h(SolarProvider, { theme }, h(Button, { disabled: false }, 'Continue')),
    );
    expect(own).not.toMatch(/<button[^>]*disabled=""/);
  });

  it('draws the theme’s styleOverrides.root over the recipe', () => {
    const theme = {
      components: {
        SolarButton: { styleOverrides: { root: { outlineOffset: '7px' } } },
      },
    };
    const html = renderToString(
      h(SolarProvider, { theme }, h(Button, null, 'Continue')),
    );
    expect(html).toContain('outline-offset:7px');
  });
});
