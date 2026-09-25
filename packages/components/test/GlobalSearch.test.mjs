import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { GlobalSearch } from '../src/GlobalSearch.tsx';

const trigger = (props = {}) => renderToString(h(GlobalSearch, props));
/** Whether an element, not the recipe's CSS, carries the class. */
const drawn = (html, cls) => new RegExp(`class="[^"]*\\b${cls}\\b`).test(html);

describe('the SOLAR GlobalSearch shell', () => {
  it('is a button that shows its placeholder, or the query, drawn filled', () => {
    const empty = trigger({ placeholder: 'Search Workplace' });
    expect(empty).toMatch(/<button class="[^"]*" type="button">/);
    expect(empty).toContain('>Search Workplace</span>');
    expect(drawn(empty, 'SolarGlobalSearch-filled')).toBe(false);
    const held = trigger({ query: 'Room 4' });
    expect(held).toContain('>Room 4</span>');
    expect(drawn(held, 'SolarGlobalSearch-filled')).toBe(true);
  });

  it('shows its shortcut in a Kbd, unread, only where the app binds one', () => {
    expect(drawn(trigger(), 'SolarGlobalSearch--kbd')).toBe(false);
    const html = trigger({ shortcut: '⌘K' });
    expect(html).toMatch(
      /SolarGlobalSearch--kbd[^>]*aria-hidden="true">(<style[^<]*<\/style>)?<kbd/,
    );
    expect(html).toContain('⌘K');
  });
});
