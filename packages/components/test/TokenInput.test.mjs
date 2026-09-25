import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { TokenInput } from '../src/TokenInput.tsx';

const field = (props = {}) => renderToString(h(TokenInput, props));
/** Whether an element, not the recipe's CSS, carries the class. */
const drawn = (html, cls) => new RegExp(`class="[^"]*\\b${cls}\\b`).test(html);

describe('the SOLAR Token Input shell', () => {
  it('draws each entry as a removable Tag, then the input for the next', () => {
    const html = field({
      defaultValue: ['Ada', 'Grace'],
      placeholder: 'Add items…',
    });
    expect(html.match(/aria-label="Remove[^"]*"/g)).toHaveLength(2);
    expect(html.indexOf('Grace')).toBeLessThan(html.indexOf('<input'));
    // Its placeholder only while there are no entries.
    expect(html).not.toContain('placeholder="Add items…"');
    expect(field({ placeholder: 'Add items…' })).toContain(
      'placeholder="Add items…"',
    );
    expect(drawn(html, 'SolarTokenInput-filled')).toBe(true);
  });

  it('counts the entries past maxVisible in a Counter', () => {
    const html = field({ defaultValue: ['a', 'b', 'c', 'd'], maxVisible: 2 });
    expect(html.match(/aria-label="Remove[^"]*"/g)).toHaveLength(2);
    expect(drawn(html, 'SolarTokenInput--counter')).toBe(true);
    expect(html).toMatch(/>2<\/span>/);
  });

  it('read-only, shows its entries with no close button and no input', () => {
    const html = field({ defaultValue: ['Ada'], readonly: true });
    expect(html).toContain('Ada');
    expect(html).not.toContain('aria-label="Remove');
    expect(html).not.toContain('<input');
  });
});
