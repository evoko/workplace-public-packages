import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { NumberInput } from '../src/NumberInput.tsx';

const field = (props = {}) => renderToString(h(NumberInput, props));
const input = (html) => /<input[^>]*>/.exec(html)[0];
const buttons = (html) => html.match(/<button[^>]*>/g) ?? [];

describe('the SOLAR Number Input shell', () => {
  it('is a spinbutton of the number, between its min and max', () => {
    const html = field({ value: 3, min: 0, max: 10, onChange() {} });
    expect(input(html)).toMatch(/role="spinbutton"/);
    expect(input(html)).toContain('aria-valuenow="3"');
    expect(input(html)).toContain('aria-valuemin="0"');
    expect(input(html)).toContain('aria-valuemax="10"');
    expect(input(html)).toContain('inputMode="decimal"');
    expect(input(html)).toContain('value="3"');
  });

  it('steps with a minus and a plus inline, out of the tab order, disabled at its limits', () => {
    const html = field({ value: 10, max: 10, onChange() {} });
    const [minus, plus] = buttons(html);
    expect(minus).toMatch(
      /aria-label="Decrease"[^>]*tabindex="-1"|tabindex="-1"[^>]*aria-label="Decrease"/i,
    );
    expect(minus).not.toContain('disabled=""');
    expect(plus).toContain('aria-label="Increase"');
    expect(plus).toContain('disabled=""');
    // The minus, the number, the plus.
    expect(html.indexOf('Decrease')).toBeLessThan(html.indexOf('<input'));
    expect(html.indexOf('Increase')).toBeGreaterThan(html.indexOf('<input'));
  });

  it('steps with a column of chevrons after the number, beside it', () => {
    const html = field({ stepper: 'side', value: 1, onChange() {} });
    const labels = buttons(html).map((b) => /aria-label="(\w+)"/.exec(b)[1]);
    expect(labels).toEqual(['Increase', 'Decrease']);
    expect(html.indexOf('<input')).toBeLessThan(html.indexOf('Increase'));
  });
});
