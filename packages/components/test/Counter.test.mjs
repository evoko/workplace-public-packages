import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { Counter } from '../src/Counter.tsx';

describe('the SOLAR Counter shell', () => {
  it('draws nothing at 0, and caps a long count at max', () => {
    expect(renderToString(h(Counter, { count: 0 }))).toBe('');
    expect(renderToString(h(Counter, { count: 120 }))).toContain('>99+<');
    expect(renderToString(h(Counter, { count: 1200, max: 999 }))).toContain(
      '>999+<',
    );
  });

  it('is a span, unless given onClick: then a button of its own', () => {
    expect(renderToString(h(Counter, { count: 3 }))).toMatch(/<span class="/);
    const button = renderToString(
      h(Counter, { count: 3, onClick: () => {}, disabled: true }),
    );
    expect(button).toMatch(/<button[^>]*type="button"/);
    expect(button).toMatch(/<button[^>]*disabled=""/);
  });

  it('marks disabled with its class, so a span shows it too', () => {
    const html = renderToString(
      h(Counter, { count: 3, disabled: true, className: 'mine' }),
    );
    expect(html).toMatch(/class="[^"]*SolarCounter-disabled mine/);
  });
});
