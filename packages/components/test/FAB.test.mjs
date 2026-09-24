import { describe, expect, it, vi } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import createEmotionServer from '@emotion/server/create-instance';
import { FAB } from '../src/FAB.tsx';

function render(element) {
  const cache = createCache({ key: 's' });
  const { extractCriticalToChunks } = createEmotionServer(cache);
  const html = renderToString(h(CacheProvider, { value: cache }, element));
  const css = extractCriticalToChunks(html)
    .styles.map((s) => s.css)
    .join('\n');
  return { html, css };
}

const plus = h('svg', { 'data-icon': 'plus' });

describe('the SOLAR FAB shell', () => {
  it('is extended with a label, and an icon alone without, which then needs a name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const icon = render(h(FAB, { icon: plus }));
    expect(warn).toHaveBeenCalledWith(
      'SOLAR FAB: an icon FAB needs an aria-label.',
    );
    warn.mockRestore();
    expect(icon.css).toContain('width:44px');
    const extended = render(h(FAB, { icon: plus }, 'New project'));
    expect(extended.html).toContain('New project');
    expect(extended.css).toContain('padding-right:var(--solar-inset-lg)');
  });

  it('hides its icon and label while loading, keeping their room, and shows the Spinner', () => {
    const { html, css } = render(
      h(FAB, { icon: plus, loading: true }, 'New project'),
    );
    expect(html).toContain('MuiButton-loading');
    expect(html).toContain('MuiCircularProgress');
    expect(css).toMatch(/\.MuiButton-startIcon\{visibility:hidden;\}/);
    expect(css).toMatch(/\.MuiButton-loading\{color:transparent;\}/);
  });
});
