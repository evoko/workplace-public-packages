import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { InlineInput } from '../src/InlineInput.tsx';

const inline = (props = {}) =>
  renderToString(
    h(InlineInput, {
      value: 'Room 4',
      onConfirm() {},
      label: 'name',
      ...props,
    }),
  );
/** Whether an element, not the recipe's CSS, carries the class. */
const drawn = (html, cls) => new RegExp(`class="[^"]*\\b${cls}\\b`).test(html);

describe('the SOLAR Inline Input shell', () => {
  it('reads as its value, with an edit button named for what it edits', () => {
    const html = inline();
    expect(html).toContain('>Room 4</span>');
    expect(html).not.toContain('<input');
    expect(html).toContain('aria-label="Edit name"');
    expect(drawn(html, 'SolarInlineInput-editing')).toBe(false);
  });

  it('opens for editing where it starts so: the input, Confirm and Cancel', () => {
    const html = inline({ defaultEditing: true });
    expect(html).toMatch(
      /<input[^>]*aria-label="name"[^>]*value="Room 4"|<input[^>]*value="Room 4"[^>]*aria-label="name"/,
    );
    expect(html).toContain('aria-label="Confirm"');
    expect(html).toContain('aria-label="Cancel"');
    expect(html).not.toContain('aria-label="Edit name"');
    // Open, with the focus off the input: Figma's filled.
    expect(drawn(html, 'SolarInlineInput-filled')).toBe(true);
  });

  it('does not open while disabled, and shows no edit button', () => {
    const html = inline({ disabled: true, defaultEditing: true });
    expect(html).not.toContain('<input');
    expect(html).not.toContain('aria-label="Edit name"');
  });
});
