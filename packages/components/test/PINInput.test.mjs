import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { PINInput } from '../src/PINInput.tsx';

const pin = (props = {}) => renderToString(h(PINInput, props));
const input = (html) => /<input[^>]*>/.exec(html)[0];
/** The cells drawn, by Figma's layer names, in their order. */
const cells = (html) =>
  [...html.matchAll(/class="SolarPINInput--(field\d?) /g)].map((m) => m[1]);

describe('the SOLAR PIN Input shell', () => {
  it('holds its code in one input a phone can fill, as long as its cells', () => {
    const html = pin({ length: 4, label: 'Code' });
    expect(input(html)).toContain('autoComplete="one-time-code"');
    expect(input(html)).toContain('inputMode="numeric"');
    expect(input(html)).toContain('maxLength="4"');
    expect(cells(html)).toHaveLength(4);
  });

  it('draws the cell the next digit goes in as Figma’s first', () => {
    expect(cells(pin({ defaultValue: '12' }))).toEqual([
      'field2',
      'field3',
      'field',
      'field4',
      'field5',
      'field6',
    ]);
    expect(pin({ defaultValue: '12' })).toMatch(
      /SolarPINInput--digit2 [^>]*>1</,
    );
  });

  it('says what is wrong in the helper’s place, in error, and describes the input by it', () => {
    const html = pin({
      id: 'c',
      error: true,
      helper: 'Sent to you',
      errorMessage: 'Wrong code',
    });
    expect(html).toContain('>Wrong code</span>');
    expect(html).not.toContain('>Sent to you</span>');
    expect(input(html)).toMatch(/aria-describedby="[^"]*-error"/);
  });
});
