import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { TextInput } from '../src/TextInput.tsx';

const field = (props = {}) => renderToString(h(TextInput, props));
const input = (html) => /<input[^>]*>/.exec(html)[0];
/** Whether an element, not the recipe's CSS, carries the class. */
const drawn = (html, cls) => new RegExp(`class="[^"]*\\b${cls}\\b`).test(html);

describe('the SOLAR Text Input shell', () => {
  it('is MUI’s InputBase, its input the field’s words, labelled by its label', () => {
    const html = field({ label: 'Name', id: 'name', placeholder: 'Ada' });
    expect(html).toMatch(
      /class="[^"]*MuiInputBase-root[^"]*SolarTextInput--field|class="SolarTextInput--field[^"]*MuiInputBase-root/,
    );
    expect(input(html)).toMatch(/class="[^"]*SolarTextInput--fieldLabel/);
    expect(input(html)).toContain('id="name"');
    expect(input(html)).toContain('placeholder="Ada"');
    expect(html).toMatch(
      /<label for="name" class="SolarTextInput-label[^"]*">/,
    );
    expect(html).toContain('>Name</span>');
  });

  it('is drawn filled where it holds a value, controlled or not', () => {
    expect(drawn(field({ value: '' }), 'SolarTextInput-filled')).toBe(false);
    expect(
      drawn(field({ value: 'Ada', onChange() {} }), 'SolarTextInput-filled'),
    ).toBe(true);
    expect(drawn(field({ defaultValue: 'Ada' }), 'SolarTextInput-filled')).toBe(
      true,
    );
    expect(input(field({ defaultValue: 'Ada' }))).toContain('value="Ada"');
  });

  it('stars a mandatory label and requires the input; the star is not read', () => {
    const html = field({ label: 'Name', mandatory: true });
    expect(input(html)).toContain('required=""');
    expect(html).toMatch(
      /SolarTextInput-mandatory[^>]*><span aria-hidden="true">\*<\/span>/,
    );
  });

  it('describes the input by its helper, and marks it invalid in error', () => {
    const html = field({ id: 'n', helper: 'Required', error: true });
    expect(input(html)).toContain('aria-describedby="n-helper"');
    expect(input(html)).toContain('aria-invalid="true"');
    expect(html).toContain('<span id="n-helper" class="SolarTextInput-helper');
    expect(drawn(html, 'SolarTextInput-error')).toBe(true);
  });

  it('draws no label, helper or icon where none is given, as the caller leaves them', () => {
    const html = field();
    for (const part of ['label', 'helper', 'leadingIcon', 'trailingIcon'])
      expect(drawn(html, `SolarTextInput-${part}`), part).toBe(false);
    expect(input(html)).not.toContain('aria-describedby');
  });

  it('draws the icons either side of the words, and disables the input with the field', () => {
    const html = field({
      leadingIcon: h('svg', { id: 'lead' }),
      trailingIcon: h('svg', { id: 'trail' }),
      disabled: true,
    });
    const lead = html.indexOf('id="lead"');
    const words = html.indexOf('<input');
    expect(lead).toBeGreaterThan(-1);
    expect(lead).toBeLessThan(words);
    expect(html.indexOf('id="trail"')).toBeGreaterThan(words);
    expect(input(html)).toContain('disabled=""');
    expect(drawn(html, 'SolarTextInput-disabled')).toBe(true);
  });
});
