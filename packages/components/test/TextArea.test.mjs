import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { TextArea } from '../src/TextArea.tsx';

const area = (props = {}) => renderToString(h(TextArea, props));
const textarea = (html) => /<textarea[^>]*>/.exec(html)[0];
/** Whether an element, not the recipe's CSS, carries the class. */
const drawn = (html, cls) => new RegExp(`class="[^"]*\\b${cls}\\b`).test(html);

describe('the SOLAR Text Area shell', () => {
  it('is MUI’s InputBase, multiline, its textarea labelled by its label', () => {
    const html = area({
      label: 'Notes',
      id: 'notes',
      placeholder: 'Add a note',
    });
    expect(textarea(html)).toMatch(/class="[^"]*SolarTextArea--enterText/);
    expect(textarea(html)).toContain('id="notes"');
    expect(html).toMatch(
      /<label for="notes" class="SolarTextArea-label[^"]*">/,
    );
  });

  it('counts its characters against maxLength, and is drawn filled with a value', () => {
    const html = area({
      defaultValue: 'Hello',
      charCount: true,
      maxLength: 500,
    });
    expect(html).toContain('>5/500</span>');
    expect(textarea(html)).toContain('maxLength="500"');
    expect(drawn(html, 'SolarTextArea-filled')).toBe(true);
  });

  it('draws the caller’s buttons in the field, and the footer only where it has a part', () => {
    const html = area({
      cta: h('button', { id: 'send' }),
      attachment: h('button', { id: 'attach' }),
    });
    expect(html).toMatch(/SolarTextArea-cta[^>]*><button id="send"/);
    expect(html).toMatch(/SolarTextArea-attachment[^>]*><button id="attach"/);
    expect(drawn(html, 'SolarTextArea-footer')).toBe(false);
    expect(drawn(area({ helper: 'More' }), 'SolarTextArea-footer')).toBe(true);
  });
});
