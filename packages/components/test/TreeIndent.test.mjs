import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { TreeIndent } from '../src/TreeIndent.tsx';

describe('the SOLAR Tree Indent shell', () => {
  it('is decorative, and draws as many units as its depth', () => {
    const html = renderToString(h(TreeIndent, { depth: '03' }));
    expect(html).toContain('aria-hidden="true"');
    expect(html.match(/SolarTreeIndent-unit\d+ /g)).toHaveLength(3);
    expect(renderToString(h(TreeIndent, {}))).not.toContain(
      'SolarTreeIndent-unit',
    );
  });
});
