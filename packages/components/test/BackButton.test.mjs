import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { BackButton } from '../src/BackButton.tsx';

describe('the SOLAR BackButton shell', () => {
  it('says Back by default, with SOLAR’s arrow', () => {
    const html = renderToString(h(BackButton, {}));
    expect(html).toContain('>Back</button>');
    expect(html).toContain('MuiButton-startIcon');
  });

  it('names the arrow alone Back, and goes where it is told', () => {
    expect(renderToString(h(BackButton, {}, null))).toContain(
      'aria-label="Back"',
    );
    expect(
      renderToString(h(BackButton, { href: '/devices' }, 'Back to Devices')),
    ).toMatch(/<a[^>]*href="\/devices"/);
  });
});
