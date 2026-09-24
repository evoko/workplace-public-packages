import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { TrendBadge } from '../src/TrendBadge.tsx';

describe('the SOLAR Trend Badge shell', () => {
  it('is decorative unless labelled, then an image with that name', () => {
    expect(renderToString(h(TrendBadge, {}))).toContain('aria-hidden="true"');
    const html = renderToString(h(TrendBadge, { label: 'Up 12%' }));
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Up 12%"');
  });

  it('draws its arrow as Figma’s outline, and a dot alone at xs', () => {
    expect(renderToString(h(TrendBadge, {}))).toMatch(
      /<svg[^>]*SolarTrendBadge-icon/,
    );
    expect(renderToString(h(TrendBadge, { size: 'xs' }))).not.toContain('<svg');
  });
});
