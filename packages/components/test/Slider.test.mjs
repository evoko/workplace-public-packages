import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { Slider } from '../src/Slider.tsx';
import { SliderRange } from '../src/SliderRange.tsx';

const inputs = (html) => html.match(/<input[^>]*>/g);

describe('the SOLAR Slider shell', () => {
  it('is MUI’s slider, a range input at its value, and says when it is in error', () => {
    const html = renderToString(
      h(Slider, {
        value: 30,
        onChange() {},
        'aria-label': 'Volume',
        error: true,
      }),
    );
    const [input] = inputs(html);
    expect(input).toMatch(/type="range"/);
    expect(input).toContain('value="30"');
    expect(html).toContain('aria-invalid="true"');
  });

  it('disables its input', () => {
    expect(
      inputs(
        renderToString(h(Slider, { defaultValue: 10, disabled: true })),
      )[0],
    ).toMatch(/disabled=""/);
  });
});

describe('the SOLAR Slider Range shell', () => {
  it('has a thumb for each end, each named', () => {
    const html = renderToString(
      h(SliderRange, {
        value: [20, 60],
        onChange() {},
        getAriaLabel: (i) => (i === 0 ? 'Lowest' : 'Highest'),
      }),
    );
    const [low, high] = inputs(html);
    expect(low).toContain('value="20"');
    expect(low).toContain('aria-label="Lowest"');
    expect(high).toContain('value="60"');
  });
});
