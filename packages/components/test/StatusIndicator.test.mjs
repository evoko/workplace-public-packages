import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import createEmotionServer from '@emotion/server/create-instance';
import { StatusIndicator } from '../src/StatusIndicator.tsx';

function render(element) {
  const cache = createCache({ key: 's' });
  const { extractCriticalToChunks } = createEmotionServer(cache);
  const html = renderToString(h(CacheProvider, { value: cache }, element));
  const css = extractCriticalToChunks(html)
    .styles.map((s) => s.css)
    .join('\n');
  return { html, css };
}

describe('the SOLAR StatusIndicator shell', () => {
  it('is decorative unless labelled, then an image with that name', () => {
    expect(render(h(StatusIndicator, {})).html).toContain('aria-hidden="true"');
    const { html } = render(h(StatusIndicator, { label: 'Success' }));
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Success"');
    expect(html).not.toContain('aria-hidden="true" class');
  });

  it('draws each type’s own layers: success is the disc with its tick, warning a triangle and a mark', () => {
    const success = render(h(StatusIndicator, { type: 'success' })).html;
    expect(success).toContain('SolarStatusIndicator--innerPath');
    expect(success).not.toContain('SolarStatusIndicator--union');
    const warning = render(h(StatusIndicator, { type: 'warning' })).html;
    expect(warning).toContain('SolarStatusIndicator--union');
    // The mark sits where Figma put it in the triangle.
    expect(warning).toContain(
      'style="position:absolute;left:calc(9px - var(--solar-placed-left, 0px));top:calc(6px - var(--solar-placed-top, 0px))"',
    );
  });

  it('draws a glyph as Figma’s outline, filled in the recipe’s colours', () => {
    const { html, css } = render(h(StatusIndicator, { type: 'danger' }));
    expect(html).toMatch(
      /<svg[^>]*SolarStatusIndicator--container[^>]*viewBox="0 0 20 20"/,
    );
    expect(html).toContain('class="SolarGlyph-stroke"');
    expect(css).toContain(
      'fill:var(--solar-color-surface-feedback-danger-strong)',
    );
    expect(css).toContain('fill:var(--solar-color-border-medium)');
  });

  it('is a dot alone at xs', () => {
    const { html } = render(h(StatusIndicator, { size: 'xs', type: 'info' }));
    expect(html).not.toContain('<svg');
    expect(html).not.toContain('SolarStatusIndicator--frame3');
  });
});
