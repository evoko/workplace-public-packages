import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { Toggle } from '../src/Toggle.tsx';

const input = (html) => html.match(/<input[^>]*>/)[0];

describe('the SOLAR Toggle shell', () => {
  it('is a native input announced as a switch, with Figma’s thumb', () => {
    const html = renderToString(h(Toggle, { 'aria-label': 'Wi-Fi' }));
    expect(input(html)).toMatch(/type="checkbox"/);
    expect(input(html)).toContain('role="switch"');
    expect(html).toMatch(/<span[^>]*class="SolarToggle-thumb/);
    expect(html).not.toMatch(/<span[^>]*class="MuiSwitch-thumb/);
  });

  it('is on where selected, or where it starts so, and says when it is disabled', () => {
    expect(
      input(renderToString(h(Toggle, { selected: true, onChange() {} }))),
    ).toMatch(/checked=""/);
    expect(input(renderToString(h(Toggle, { defaultSelected: true })))).toMatch(
      /checked=""/,
    );
    const off = renderToString(h(Toggle, { disabled: true }));
    expect(input(off)).toMatch(/disabled=""/);
    expect(off).toMatch(/class="[^"]*SolarToggle-disabled/);
  });
});
