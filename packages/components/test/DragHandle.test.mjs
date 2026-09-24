import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { DragHandle } from '../src/DragHandle.tsx';

describe('the SOLAR DragHandle shell', () => {
  it('is focusable and announced as a drag handle, "Reorder" by default', () => {
    const html = renderToString(h(DragHandle));
    expect(html).toContain('aria-roledescription="drag handle"');
    expect(html).toContain('aria-label="Reorder"');
    expect(html).toContain('tabindex="0"');
    expect(
      html.match(/<span[^>]*class="SolarDragHandle-col\dDot/g),
    ).toHaveLength(6);
  });

  it('takes a name of its own, and leaves the tab order when disabled', () => {
    const html = renderToString(
      h(DragHandle, { 'aria-label': 'Reorder Room A', disabled: true }),
    );
    expect(html).toContain('aria-label="Reorder Room A"');
    expect(html).toContain('tabindex="-1"');
    expect(html).toContain('aria-disabled="true"');
  });
});
