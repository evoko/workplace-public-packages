import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import RadioGroup from '@mui/material/RadioGroup';
import { Radio } from '../src/Radio.tsx';

const inputs = (html) => html.match(/<input[^>]*>/g);
const dot = /<svg[^>]*SolarRadio-icon/g;

describe('the SOLAR Radio shell', () => {
  it('is checked by its group’s value, and named by it', () => {
    const html = renderToString(
      h(RadioGroup, { value: 'b', name: 'plan' }, [
        h(Radio, { key: 'a', value: 'a' }),
        h(Radio, { key: 'b', value: 'b' }),
      ]),
    );
    const [a, b] = inputs(html);
    expect(a).toMatch(/type="radio"/);
    expect(a).toContain('name="plan"');
    expect(a).not.toMatch(/checked=""/);
    expect(b).toMatch(/checked=""/);
    // The dot is drawn in the checked one alone.
    expect(html.match(dot)).toHaveLength(1);
  });

  it('is checked by its prop outside a group, and disables its input', () => {
    const html = renderToString(
      h(Radio, { value: 'a', checked: true, disabled: true, onChange() {} }),
    );
    expect(html.match(dot)).toHaveLength(1);
    expect(inputs(html)[0]).toMatch(/disabled=""/);
  });
});
