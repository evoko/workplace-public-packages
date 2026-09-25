import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { Tag } from '../src/Tag.tsx';
import { cls } from './classes.mjs';

const drawn = (html, layer) =>
  new RegExp(`<[a-z]+[^>]*class="${cls('Tag', layer)}[ "]`).test(html);

describe('the SOLAR Tag shell', () => {
  it('draws the status dot, a StatusIndicator, where indicator is set', () => {
    const html = renderToString(
      h(Tag, { status: 'info', indicator: true }, 'Active'),
    );
    expect(drawn(html, 'statusIndicator')).toBe(true);
    expect(html).toContain('>Active</span>');
    expect(drawn(renderToString(h(Tag, {}, 'Active')), 'statusIndicator')).toBe(
      false,
    );
  });

  it('draws a close button named with its words where onClose is given', () => {
    const html = renderToString(h(Tag, { onClose() {} }, 'Room A'));
    expect(html).toMatch(
      /<button type="button" aria-label="Remove Room A" class="SolarTag--iconClose/,
    );
  });

  it('puts an icon before the words, or alone, in its own place', () => {
    const icon = h('svg');
    expect(drawn(renderToString(h(Tag, { icon }, 'Beta')), 'iconNone')).toBe(
      true,
    );
    const alone = renderToString(h(Tag, { icon, 'aria-label': 'New' }));
    expect(drawn(alone, 'icon')).toBe(true);
    expect(drawn(alone, 'label')).toBe(false);
  });
});
