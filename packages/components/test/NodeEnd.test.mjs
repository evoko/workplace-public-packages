import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { NodeEnd } from '../src/NodeEnd.tsx';

describe('the SOLAR Node End shell', () => {
  it('is decorative, and draws the dot and its halo', () => {
    const html = renderToString(h(NodeEnd, { halo: true }));
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('SolarNodeEnd-halo');
    expect(html).toContain('SolarNodeEnd-dot');
  });
});
