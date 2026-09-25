import { afterEach, describe, expect, it, vi } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import createEmotionServer from '@emotion/server/create-instance';
import { Button } from '../src/Button.tsx';
import { ButtonGroup } from '../src/ButtonGroup.tsx';

/** Server-renders one element and returns its markup and the CSS emotion produced for it. */
function render(element) {
  const cache = createCache({ key: 's' });
  const { extractCriticalToChunks } = createEmotionServer(cache);
  const html = renderToString(h(CacheProvider, { value: cache }, element));
  const css = extractCriticalToChunks(html)
    .styles.map((s) => s.css)
    .join('\n');
  return { html, css };
}

/** Every declaration emotion wrote for the group's own class, before any nested selector. */
function rootRule({ html, css }) {
  // A Box's emotion class has no label: s-<hash>.
  const cls = /^<div[^>]*class="[^"]*\b(s-[a-z0-9]+)\b/.exec(html)[1];
  return [...css.matchAll(new RegExp(`\\.${cls}\\{([^}]*)\\}`, 'g'))]
    .map((m) => m[1])
    .join(';');
}
const last = (rule, prop) =>
  [...rule.matchAll(new RegExp(`(?<![-a-z])${prop}:([^;}]+)`, 'g'))].at(
    -1,
  )?.[1];

const buttons = (size) => [
  h(Button, { key: 'a', prio: 'secondary', size }, 'Cancel'),
  h(Button, { key: 'b', size }, 'Save'),
];

afterEach(() => vi.restoreAllMocks());

describe('the SOLAR Button Group shell', () => {
  it('is a group of the caller’s buttons, laid out by the recipe as a padded row', () => {
    const out = render(h(ButtonGroup, null, buttons()));
    expect(out.html).toMatch(/^<div[^>]*role="group"/);
    expect(out.html.match(/<button/g)).toHaveLength(2);
    const rule = rootRule(out);
    expect(last(rule, 'display')).toBe('flex');
    expect(last(rule, 'flex-direction')).toBe('row');
    expect(last(rule, 'gap')).toBe('var(--solar-inset-xs)');
    expect(last(rule, 'padding-left')).toBe('var(--solar-inset-sm)');
    // Every button fills its share, and only the room its siblings leave it.
    expect(out.css).toMatch(/>\*\{width:100%;min-width:0;?\}/);
  });

  it('stacks vertically, and draws the full-width bar flush with a divider on top only', () => {
    expect(
      last(
        rootRule(
          render(h(ButtonGroup, { orientation: 'vertical' }, buttons())),
        ),
        'flex-direction',
      ),
    ).toBe('column');
    const bar = rootRule(
      render(h(ButtonGroup, { type: 'full-width' }, buttons('lg'))),
    );
    expect(last(bar, 'padding-top')).toBe('var(--solar-inset-none)');
    expect(last(bar, 'border-top-width')).toBe('var(--solar-border-default)');
    expect(last(bar, 'border-top-style')).toBe('solid');
    expect(last(bar, 'border-bottom-style')).toBe('none');
  });

  it('never changes its buttons’ props', () => {
    const { html } = render(h(ButtonGroup, null, buttons('sm')));
    // Both stay sm: 32px, as a Button draws itself.
    expect(html.match(/<button/g)).toHaveLength(2);
    const { css } = render(h(ButtonGroup, null, buttons('sm')));
    expect(css).not.toMatch(/>\*\{[^}]*height/);
  });

  it('warns in development when its buttons mix sizes, and not when they share one', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(h(ButtonGroup, null, buttons('sm')));
    expect(warn).not.toHaveBeenCalled();
    render(
      h(ButtonGroup, null, [
        h(Button, { key: 'a', size: 'sm' }, 'One'),
        h(Button, { key: 'b' }, 'Two'),
      ]),
    );
    expect(warn).toHaveBeenCalledWith(
      'SOLAR Button Group: its buttons should share one size.',
    );
  });
});
