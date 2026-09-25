import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { SegmentedControl } from '../src/SegmentedControl.tsx';
import { SegmentedControlItem } from '../src/SegmentedControlItem.tsx';

const control = (props = {}) =>
  renderToString(
    h(SegmentedControl, { value: 'week', onChange() {}, ...props }, [
      h(SegmentedControlItem, { key: 'd', value: 'day' }, 'Day'),
      h(SegmentedControlItem, { key: 'w', value: 'week' }, 'Week'),
    ]),
  );

describe('the SOLAR Segmented Control shell', () => {
  it('is a radio group of native radios of one name, the control’s value chosen', () => {
    const html = control({ name: 'range' });
    expect(html).toContain('role="radiogroup"');
    const inputs = html.match(/<input[^>]*>/g);
    expect(inputs).toHaveLength(2);
    for (const i of inputs) expect(i).toMatch(/type="radio"[^>]*name="range"/);
    expect(inputs[0]).not.toMatch(/checked=""/);
    expect(inputs[1]).toMatch(/checked=""/);
    expect(html).toContain('>Week</span>');
  });

  it('names the group by its label, starred where mandatory, with its helper below', () => {
    const html = control({
      label: 'Range',
      mandatory: true,
      helper: 'Pick one',
    });
    const id = /<span id="([^"]+)">Range<\/span>/.exec(html)[1];
    expect(html).toContain(`aria-labelledby="${id}"`);
    expect(html).toContain('aria-required="true"');
    expect(html).toMatch(
      /SolarSegmentedControl-mandatory[^>]*><span aria-hidden="true">\*<\/span>/,
    );
    expect(html).toContain('>Pick one</span>');
  });

  it('draws no label or helper where none is given, as Figma does', () => {
    const html = control();
    expect(html).not.toMatch(/<span[^>]*class="SolarSegmentedControl--label /);
    expect(html).not.toMatch(/<span[^>]*class="SolarSegmentedControl-helper /);
  });
});

describe('the SOLAR Segmented Control Item shell', () => {
  it('is selected by its prop outside a control, and draws an icon only where given', () => {
    const html = renderToString(
      h(
        SegmentedControlItem,
        { value: 'a', selected: true, iconLeading: h('svg') },
        'A',
      ),
    );
    expect(html).toMatch(/<label/);
    expect(html.match(/<input[^>]*>/)[0]).toMatch(
      /checked=""[^>]*readOnly|readOnly[^>]*checked=""/i,
    );
    expect(html).toMatch(/class="[^"]*SolarSegmentedControlItem-iconLeading/);
    expect(html).not.toMatch(
      /<span[^>]*class="SolarSegmentedControlItem-iconTrailing/,
    );
  });
});
