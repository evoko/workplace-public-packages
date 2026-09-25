import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { Checkbox } from '../src/Checkbox.tsx';

const input = (html) => html.match(/<input[^>]*>/)[0];

describe('the SOLAR Checkbox shell', () => {
  it('is a native checkbox, drawing the tick only where checked', () => {
    const off = renderToString(h(Checkbox, { 'aria-label': 'Email me' }));
    expect(input(off)).toMatch(/type="checkbox"/);
    expect(off).not.toMatch(/<svg[^>]*SolarCheckbox--icon/);
    const on = renderToString(h(Checkbox, { checked: true, onChange() {} }));
    expect(input(on)).toMatch(/checked=""/);
    expect(on).toMatch(/<svg[^>]*class="SolarCheckbox--icon/);
    expect(on).not.toMatch(/<svg[^>]*SolarCheckbox--container/);
  });

  it('draws the dash where mixed, checked or not, and announces it mixed', () => {
    const html = renderToString(h(Checkbox, { mixed: true }));
    expect(html).toMatch(/<svg[^>]*class="SolarCheckbox--container/);
    expect(html).not.toMatch(/<svg[^>]*SolarCheckbox--icon/);
    expect(input(html)).toContain('aria-checked="mixed"');
  });

  it('keeps its own value where uncontrolled, and disables its input', () => {
    expect(renderToString(h(Checkbox, { defaultChecked: true }))).toMatch(
      /<svg[^>]*SolarCheckbox--icon/,
    );
    expect(input(renderToString(h(Checkbox, { disabled: true })))).toMatch(
      /disabled=""/,
    );
  });
});
