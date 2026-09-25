import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { SplitButton } from '../src/SplitButton.tsx';

describe('the SOLAR SplitButton shell', () => {
  it('is two buttons in a group, the chevron saying it opens a menu', () => {
    const html = renderToString(h(SplitButton, { menuOpen: true }, 'Save'));
    expect(html).toContain('role="group"');
    expect(html.match(/<button/g)).toHaveLength(2);
    expect(html).toMatch(
      /<button[^>]*aria-label="More options"[^>]*aria-haspopup="menu"[^>]*aria-expanded="true"/,
    );
    expect(html).toContain('>Save</span>');
  });

  it('hides its halves while loading, keeping their room, and shows the Spinner', () => {
    const html = renderToString(h(SplitButton, { loading: true }, 'Save'));
    expect(html).toContain('aria-busy="true"');
    expect(html).toMatch(
      /SolarSplitButton--action[^"]*"[^>]*style="visibility:hidden"/,
    );
    expect(html).toContain('MuiCircularProgress');
  });
});
