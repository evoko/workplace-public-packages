import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { Link } from '../src/Link.tsx';

describe('the SOLAR Link shell', () => {
  it('is an <a> with its words, and its icons only where given', () => {
    const html = renderToString(h(Link, { href: '/notes' }, 'Release notes'));
    expect(html).toMatch(/<a[^>]*href="\/notes"/);
    expect(html).toContain('>Release notes</span>');
    expect(html).not.toMatch(/class="[^"]*SolarLink-leadingIcon/);
    const withIcon = renderToString(
      h(Link, { href: '/x', trailingIcon: h('svg') }, 'Docs'),
    );
    expect(withIcon).toMatch(/class="[^"]*SolarLink-trailingIcon/);
  });

  it('is no link when disabled: no href, and says so', () => {
    const html = renderToString(
      h(Link, { href: '/notes', disabled: true }, 'Release notes'),
    );
    expect(html).not.toContain('href=');
    expect(html).toContain('aria-disabled="true"');
  });
});
