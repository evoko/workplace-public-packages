import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import createEmotionServer from '@emotion/server/create-instance';
import { Button } from '../src/Button.tsx';
import { Spinner } from '../src/Spinner.tsx';

function render(element) {
  const cache = createCache({ key: 's' });
  const { extractCriticalToChunks } = createEmotionServer(cache);
  const html = renderToString(h(CacheProvider, { value: cache }, element));
  const css = extractCriticalToChunks(html)
    .styles.map((s) => s.css)
    .join('\n');
  return { html, css };
}

/** The value of `prop` in the last rule whose selector ends in `selector`. */
const lastIn = (css, selector, prop) =>
  [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)]
    .filter(([, sel]) => sel.trim().endsWith(selector))
    .flatMap(([, , body]) =>
      [...body.matchAll(new RegExp(`(?<![-a-z])${prop}:([^;}]+)`, 'g'))].map(
        (m) => m[1],
      ),
    )
    .at(-1);

describe('the SOLAR Spinner shell', () => {
  it('draws SOLAR’s track and indicator on MUI’s CircularProgress', () => {
    const { html, css } = render(h(Spinner, { 'aria-label': 'Loading' }));
    expect(html).toContain('role="progressbar"');
    expect(html).toContain('MuiCircularProgress-track');
    expect(lastIn(css, '.MuiCircularProgress-track', 'stroke')).toBe(
      'var(--solar-color-border-subtle)',
    );
    expect(lastIn(css, '.MuiCircularProgress-circle', 'stroke')).toBe(
      'var(--solar-color-border-strong)',
    );
    expect(lastIn(css, '.MuiCircularProgress-circle', 'stroke-width')).toBe(
      'var(--solar-border-strong)',
    );
    // MUI fades its track to 12%; SOLAR's track colour is drawn as it is.
    expect(lastIn(css, '.MuiCircularProgress-track', 'opacity')).toBe('1');
  });

  it('takes its size from the recipe, not from MUI’s inline size', () => {
    const { html, css } = render(h(Spinner, { size: 'lg' }));
    expect(html).toContain('width:100%;height:100%');
    expect(css).toContain('width:32px;height:32px');
  });

  it('is what a loading Button shows, in the variant Figma picks for it', () => {
    const primary = render(h(Button, { loading: true }, 'Save'));
    expect(primary.html).toMatch(
      /MuiButton-loadingIndicator[\s\S]*MuiCircularProgress-track/,
    );
    expect(primary.css).toContain('var(--solar-color-border-inverse-strong)');
    const secondary = render(
      h(Button, { loading: true, prio: 'secondary' }, 'Save'),
    );
    expect(secondary.css).toContain('var(--solar-color-border-strong)');
    expect(secondary.css).not.toContain('inverse');
    // lg shows the md spinner.
    expect(
      render(h(Button, { loading: true, size: 'lg' }, 'Save')).css,
    ).toContain('width:24px;height:24px');
  });
});
