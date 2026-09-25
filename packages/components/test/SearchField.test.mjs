import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { SearchField } from '../src/SearchField.tsx';

const field = (props = {}) => renderToString(h(SearchField, props));
const input = (html) => /<input[^>]*>/.exec(html)[0];
/** Whether an element, not the recipe's CSS, carries the class. */
const drawn = (html, cls) => new RegExp(`class="[^"]*\\b${cls}\\b`).test(html);

describe('the SOLAR SearchField shell', () => {
  it('is MUI’s InputBase, a search input named Search unless it says more', () => {
    const html = field({ placeholder: 'Filter rooms' });
    expect(html).toMatch(/class="[^"]*MuiInputBase-root/);
    expect(input(html)).toContain('type="search"');
    expect(input(html)).toContain('aria-label="Search"');
    expect(
      input(field({ inputProps: { 'aria-label': 'Search rooms' } })),
    ).toContain('aria-label="Search rooms"');
  });

  it('draws SOLAR’s search icon, the caller’s filter only where given, and filled with a query', () => {
    expect(field()).toMatch(
      /<svg[^>]*class="[^"]*SolarSearchField--iconSearch/,
    );
    expect(drawn(field(), 'SolarSearchField-filter')).toBe(false);
    expect(field({ filter: h('button', { id: 'f' }) })).toMatch(
      /SolarSearchField-filter[^>]*><button id="f"/,
    );
    expect(
      drawn(field({ defaultValue: 'desk' }), 'SolarSearchField-filled'),
    ).toBe(true);
  });
});
