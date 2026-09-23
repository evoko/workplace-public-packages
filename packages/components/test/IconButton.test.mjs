import { afterEach, describe, expect, it, vi } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import createEmotionServer from '@emotion/server/create-instance';
import { IconButton } from '../src/IconButton.tsx';

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

/** Every declaration emotion wrote for the button's own class, before any nested selector. */
function rootRule({ html, css }) {
  const cls = /<button class="[^"]*\b(s-[a-z0-9]+-[A-Za-z-]+)/.exec(html)[1];
  return [...css.matchAll(new RegExp(`\\.${cls}\\{([^}]*)\\}`, 'g'))]
    .map((m) => m[1])
    .join(';');
}
const last = (rule, prop) =>
  [...rule.matchAll(new RegExp(`(?<![-a-z])${prop}:([^;}]+)`, 'g'))].at(
    -1,
  )?.[1];

const icon = h('svg', { viewBox: '0 0 24 24' });

afterEach(() => vi.restoreAllMocks());

describe('the SOLAR Icon Button shell', () => {
  it('renders a native button, named by its aria-label, styled by the recipe', () => {
    const out = render(h(IconButton, { icon, 'aria-label': 'Delete' }));
    expect(out.html).toMatch(/^<button[^>]*aria-label="Delete"/);
    const rule = rootRule(out);
    expect(last(rule, 'background-color')).toBe(
      'var(--solar-color-action-primary-bg-default)',
    );
    expect(last(rule, 'border-radius')).toBe('var(--solar-radius-control)');
    expect(last(rule, 'height')).toBe('32px');
    expect(out.html).not.toContain('MuiTouchRipple');
  });

  it('is round by its shape prop, and sized by its size prop, which never reach MUI', () => {
    const out = render(
      h(IconButton, {
        icon,
        'aria-label': 'Add',
        shape: 'round',
        size: 'lg',
      }),
    );
    const rule = rootRule(out);
    expect(last(rule, 'border-radius')).toBe('var(--solar-radius-pill)');
    expect(last(rule, 'height')).toBe('48px');
    expect(out.html).not.toMatch(/MuiIconButton-size(Large|Small)/);
  });

  it('puts the icon in a box the recipe sizes from the icon ladder', () => {
    const { html, css } = render(
      h(IconButton, { icon, 'aria-label': 'Add', size: 'md' }),
    );
    expect(html).toMatch(/<span class="SolarIconButton-icon"><svg/);
    expect(css).toMatch(
      /\.SolarIconButton-icon\{[^}]*width:var\(--solar-icon-sm\)/,
    );
  });

  it('warns in development when it has no accessible name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(h(IconButton, { icon }));
    expect(warn).toHaveBeenCalledWith(
      'SOLAR Icon Button: it needs an aria-label or aria-labelledby.',
    );
    warn.mockClear();
    render(h(IconButton, { icon, 'aria-labelledby': 'title' }));
    expect(warn).not.toHaveBeenCalled();
  });

  it('shows the Spinner Figma picks while loading, in place of the icon', () => {
    const { html } = render(
      h(IconButton, { icon, 'aria-label': 'Save', loading: true }),
    );
    expect(html).toContain('MuiIconButton-loading');
    expect(html).toContain('MuiIconButton-loadingIndicator');
    expect(html).toContain('MuiCircularProgress');
    expect(html).not.toContain('SolarIconButton-icon');
  });

  it('is disabled, with its icon and no spinner, when both disabled and loading', () => {
    const { html } = render(
      h(IconButton, {
        icon,
        'aria-label': 'Save',
        disabled: true,
        loading: true,
      }),
    );
    const classes = /<button[^>]*class="([^"]*)"/.exec(html)[1].split(' ');
    expect(classes).toContain('Mui-disabled');
    expect(classes).not.toContain('MuiIconButton-loading');
    expect(html).toContain('SolarIconButton-icon');
  });
});
