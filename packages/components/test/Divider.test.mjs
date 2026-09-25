import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { Divider } from '../src/Divider.tsx';

describe('the SOLAR Divider shell', () => {
  it('is a separator, vertical where it is one', () => {
    expect(renderToString(h(Divider, {}))).toMatch(
      /<div[^>]*role="separator"[^>]*aria-orientation="horizontal"/,
    );
    expect(renderToString(h(Divider, { orientation: 'vertical' }))).toContain(
      'aria-orientation="vertical"',
    );
  });

  it('draws a label between two rules, named by it', () => {
    const html = renderToString(h(Divider, { type: 'with-label' }, 'Or'));
    expect(html).toContain('aria-label="Or"');
    expect(html).toMatch(
      /SolarDivider--rule .*SolarDivider--label.*SolarDivider--rule2/,
    );
  });
});
