import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { RowExpand } from '../src/RowExpand.tsx';

describe('the SOLAR RowExpand shell', () => {
  it('is decorative, a chevron when collapsed, a connector beside a child row', () => {
    const collapsed = renderToString(h(RowExpand, { type: 'collapsed' }));
    expect(collapsed).toContain('aria-hidden="true"');
    expect(collapsed).toMatch(/<svg[^>]*SolarRowExpand--iconChevronRight/);
    const middle = renderToString(h(RowExpand, { type: 'middle-row' }));
    expect(middle).toContain('SolarRowExpand--container2');
    expect(middle).not.toMatch(/class="[^"]*SolarRowExpand-icon/);
  });
});
