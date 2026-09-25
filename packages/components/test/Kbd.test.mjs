import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import createEmotionServer from '@emotion/server/create-instance';
import { Kbd } from '../src/Kbd.tsx';

function render(element) {
  const cache = createCache({ key: 's' });
  const { extractCriticalToChunks } = createEmotionServer(cache);
  const html = renderToString(h(CacheProvider, { value: cache }, element));
  const css = extractCriticalToChunks(html)
    .styles.map((s) => s.css)
    .join('\n');
  return { html, css };
}

describe('the SOLAR Kbd shell', () => {
  it('is a <kbd>, its label the caller’s words, read as they are', () => {
    const { html } = render(h(Kbd, {}, 'Ctrl'));
    expect(html).toMatch(/^<kbd[^>]*>/);
    expect(html).toMatch(
      /<span class="SolarKbd--label SolarKbd-text">Ctrl<\/span>/,
    );
    expect(html).not.toContain('aria-hidden');
  });

  it('takes the top-search cap’s fill from the recipe', () => {
    const { css } = render(h(Kbd, { type: 'top-search' }, 'K'));
    expect(css).toContain(
      'background-color:var(--solar-color-surface-feedback-neutral-medium)',
    );
  });
});
