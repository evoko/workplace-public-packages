import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import createEmotionServer from '@emotion/server/create-instance';
import { Avatar, initialsOf } from '../src/Avatar.tsx';

function render(element) {
  const cache = createCache({ key: 's' });
  const { extractCriticalToChunks } = createEmotionServer(cache);
  const html = renderToString(h(CacheProvider, { value: cache }, element));
  const css = extractCriticalToChunks(html)
    .styles.map((s) => s.css)
    .join('\n');
  return { html, css };
}

describe('the SOLAR Avatar shell', () => {
  it('shows a name’s initials, named by it', () => {
    const { html } = render(h(Avatar, { name: 'Dana Scully' }));
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Dana Scully"');
    expect(html).toContain('>DS</span>');
    expect(initialsOf('Zoë Ångström')).toBe('ZA');
    expect(initialsOf('Cher')).toBe('CH');
  });

  it('takes any colour, its initials in that hue at AA, unless told otherwise', () => {
    const { css } = render(
      h(Avatar, { name: 'Dana Scully', color: '#410001' }),
    );
    expect(css).toContain('background-color:#410001');
    expect(css).toContain('color:rgb(255 224 219)');
    const given = render(
      h(Avatar, { name: 'D S', color: '#410001', textColor: 'white' }),
    );
    expect(given.css).toContain('color:white');
  });

  it('shows a photo instead, and a logo whole', () => {
    const photo = render(
      h(Avatar, { name: 'Dana', type: 'photo', src: 'a.png' }),
    );
    expect(photo.html).toContain('src="a.png"');
    expect(photo.html).toContain('alt="Dana"');
    expect(photo.html).not.toContain('SolarAvatar-initials');
    const logo = render(
      h(Avatar, { name: 'Biamp', type: 'logo', src: 'l.png' }),
    );
    expect(logo.html).toContain('object-fit:contain');
  });
});
