import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { Cursor } from '../src/Cursor.tsx';

describe('the SOLAR Cursor shell', () => {
  it('is decorative, and draws each type’s own glyph', () => {
    const arrow = renderToString(h(Cursor, {}));
    expect(arrow).toContain('aria-hidden="true"');
    expect(arrow).toMatch(/<svg[^>]*SolarCursor-rectangle237/);
    expect(renderToString(h(Cursor, { type: 'Pointer' }))).not.toMatch(
      /class="[^"]*SolarCursor-rectangle237/,
    );
  });
});
