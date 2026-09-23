import { afterEach, describe, expect, it, vi } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import createEmotionServer from '@emotion/server/create-instance';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Button } from '../src/Button.tsx';

/** Server-renders one element and returns its markup and the CSS emotion produced for it. */
function render(element) {
  const cache = createCache({ key: 's' });
  const { extractCriticalToChunks } = createEmotionServer(cache);
  const html = renderToString(h(CacheProvider, { value: cache }, element));
  const css = extractCriticalToChunks(html)
    .styles.map((s) => s.css)
    .join('\n');
  return { html, css };
}

afterEach(() => vi.restoreAllMocks());

describe('the SOLAR Button shell', () => {
  it('renders a native button styled entirely by the recipe', () => {
    const { html, css } = render(h(Button, null, 'Save'));
    expect(html).toMatch(/^<button[^>]*type="button"/);
    expect(css).toContain(
      'background-color:var(--solar-color-action-primary-bg-default)',
    );
    expect(css).toContain('border-radius:var(--solar-radius-control)');
    // MUI's own look loses to the recipe even with no SOLAR theme installed: MUI's rules still
    // appear, but the recipe's come later in the same rule, so they win. And there is no ripple.
    // The button's own rule, found by the emotion class on the rendered <button>: every
    // declaration emotion wrote for that selector, in order, before any nested or state selector.
    const cls = /<button class="[^"]*\b(s-[a-z0-9]+-[A-Za-z-]+)/.exec(html)[1];
    const root = [...css.matchAll(new RegExp(`\\.${cls}\\{([^}]*)\\}`, 'g'))]
      .map((m) => m[1])
      .join(';');
    const last = (prop) =>
      [...root.matchAll(new RegExp(`(?<![-a-z])${prop}:([^;}]+)`, 'g'))].at(
        -1,
      )?.[1];
    expect(last('text-transform')).toBe('none');
    expect(last('color')).toBe(
      'var(--solar-color-action-primary-text-default)',
    );
    expect(last('min-width')).toBe('auto');
    expect(html).not.toContain('MuiTouchRipple');
  });

  it('keeps the defaults for every prop the caller left out, and says so in the winning rule', () => {
    // The shell forwards every prop it destructured, so an unset one arrives as undefined. That
    // must not erase its default: tertiary alone is transparent, not primary's fill.
    const rule = (element) => {
      const { html, css } = render(element);
      const cls = /<button class="[^"]*\b(s-[a-z0-9]+-[A-Za-z-]+)/.exec(
        html,
      )[1];
      return [...css.matchAll(new RegExp(`\\.${cls}\\{([^}]*)\\}`, 'g'))]
        .map((m) => m[1])
        .join(';');
    };
    const last = (css, prop) =>
      [...css.matchAll(new RegExp(`(?<![-a-z])${prop}:([^;}]+)`, 'g'))].at(
        -1,
      )?.[1];
    expect(
      last(
        rule(h(Button, { variant: 'tertiary' }, 'Skip')),
        'background-color',
      ),
    ).toBe('transparent');
    expect(last(rule(h(Button, { size: 'sm' }, 'Save')), 'height')).toBe(
      '32px',
    );
    expect(last(rule(h(Button, null, 'Save')), 'background-color')).toBe(
      'var(--solar-color-action-primary-bg-default)',
    );
  });

  it('passes variant, size and danger to the recipe, not to MUI', () => {
    const { html, css } = render(
      h(Button, { variant: 'secondary', size: 'sm', danger: true }, 'Remove'),
    );
    expect(css).toContain(
      'var(--solar-color-action-secondary-bg-danger-default)',
    );
    expect(css).toContain('padding-left:var(--solar-inset-xs)');
    expect(html).not.toMatch(/MuiButton-(secondary|sizeSm)/);
  });

  it('is disabled and loading through MUI, which sets the classes the recipe styles', () => {
    expect(render(h(Button, { disabled: true }, 'Save')).html).toMatch(
      /disabled=""/,
    );
    const loading = render(h(Button, { loading: true }, 'Save'));
    expect(loading.html).toContain('MuiButton-loading');
    expect(loading.html).toContain('MuiButton-loadingIndicator');
  });

  it('draws a loading button in its own colours, although MUI marks it disabled too', () => {
    const { html, css } = render(h(Button, { loading: true }, 'Save'));
    // MUI sets Mui-disabled on a loading button, so the disabled colours must exclude it.
    expect(html).toMatch(/class="[^"]*Mui-disabled[^"]*MuiButton-loading/);
    const rules = [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)];
    const disabledBg = rules.filter(([, , body]) =>
      body.includes('--solar-color-action-primary-bg-disabled'),
    );
    expect(disabledBg.length).toBeGreaterThan(0);
    for (const [, selector] of disabledBg)
      expect(selector).toContain(':not(.MuiButton-loading)');
  });

  it('is disabled, with no spinner, when both disabled and loading', () => {
    const { html } = render(
      h(Button, { disabled: true, loading: true }, 'Save'),
    );
    const classes = /<button[^>]*class="([^"]*)"/.exec(html)[1].split(' ');
    expect(classes).toContain('Mui-disabled');
    expect(classes).not.toContain('MuiButton-loading');
    expect(html).not.toContain('MuiButton-loadingIndicator');
  });

  it('keeps SOLAR’s shadow in every state: no Material elevation, whatever the app theme', () => {
    // An app theme that defaults Buttons to contained would bring Material's shadows; and MUI's
    // disableElevation writes box-shadow none on hover and press, over SOLAR's control shadow.
    const theme = createTheme({
      components: { MuiButton: { defaultProps: { variant: 'contained' } } },
    });
    const { html, css } = render(
      h(ThemeProvider, { theme }, h(Button, null, 'Save')),
    );
    const classes = /<button[^>]*class="([^"]*)"/.exec(html)[1].split(' ');
    expect(classes).toContain('MuiButton-text');
    expect(classes).not.toContain('MuiButton-disableElevation');
    expect(css).not.toMatch(/:hover\{box-shadow:none/);
  });

  it('puts the icons in MUI’s slots and the counter in its own', () => {
    const { html } = render(
      h(
        Button,
        {
          iconLeading: h('svg', { id: 'lead' }),
          iconTrailing: h('svg', { id: 'trail' }),
          counter: 3,
        },
        'Inbox',
      ),
    );
    expect(html).toMatch(/MuiButton-startIcon[^>]*><svg id="lead"/);
    expect(html).toMatch(/MuiButton-endIcon[^>]*><svg id="trail"/);
    expect(html).toContain('<span class="SolarButton-counter">3</span>');
  });

  it('warns about an icon-only button with no accessible name, and not otherwise', () => {
    const warn = vi
      .spyOn(globalThis.console, 'warn')
      .mockImplementation(() => {});
    render(h(Button, { iconLeading: h('svg') }));
    expect(warn).toHaveBeenCalledWith(
      'SOLAR Button: an icon-only button needs an aria-label.',
    );
    warn.mockClear();
    render(h(Button, { iconLeading: h('svg'), 'aria-label': 'Delete' }));
    render(h(Button, null, 'Save'));
    expect(warn).not.toHaveBeenCalled();
  });

  it('keeps a caller’s sx on top of the recipe', () => {
    const { css } = render(h(Button, { sx: { marginTop: '4px' } }, 'Save'));
    expect(css).toContain('margin-top:4px');
    expect(css).toContain('var(--solar-color-action-primary-bg-default)');
  });
});
