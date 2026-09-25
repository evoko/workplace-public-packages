import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { BarChart } from '../src/BarChart.tsx';
import { BarStack } from '../src/BarStack.tsx';
import { ChartTooltip } from '../src/ChartTooltip.tsx';
import { DataLegend } from '../src/DataLegend.tsx';
import { DonutChart } from '../src/DonutChart.tsx';
import { Sparkline, sparklinePath, trendOf } from '../src/Sparkline.tsx';

const html = (el) => renderToString(el);
/** Whether an element, not the recipe's CSS, carries the class. */
const drawn = (text, cls) => new RegExp(`class="[^"]*\\b${cls}\\b`).test(text);

describe('the SOLAR Sparkline shell', () => {
  it('scales a series into its box, first to last, the highest at its top', () => {
    expect(sparklinePath([0, 10, 5], 80, 24)).toBe('M0 24L40 0L80 12');
    // A flat series runs across the middle.
    expect(sparklinePath([3, 3], 80, 24)).toBe('M0 12L80 12');
    expect(sparklinePath([], 80, 24)).toBe('');
  });

  it('takes its trend from its data, where none is given', () => {
    expect(trendOf([1, 2, 3])).toBe('up');
    expect(trendOf([3, 1])).toBe('down');
    expect(trendOf([2, 5, 2])).toBe('flat');
  });

  it('draws the data’s line in its trend’s colour, and Figma’s sample without data', () => {
    const rising = html(h(Sparkline, { data: [1, 4, 9], label: 'Revenue' }));
    expect(rising).toContain('role="img"');
    expect(rising).toContain('aria-label="Revenue"');
    expect(rising).toContain('d="M0 24L40 15L80 0"');
    expect(rising).toContain('--solar-color-data-delta-positive-500');
    const falling = html(h(Sparkline, { data: [9, 1] }));
    expect(falling).toContain('--solar-color-data-delta-negative-500');
    // Figma's line, an outline, where there is no data.
    expect(html(h(Sparkline, {}))).toContain('SolarGlyph-stroke');
  });
});

describe('the SOLAR Data Legend and Chart Tooltip shells', () => {
  it('lists each series, its dot in its colour', () => {
    const legend = html(
      h(DataLegend, {
        items: [
          { label: 'Rooms', color: 'rgb(1, 2, 3)' },
          { label: 'Devices', color: 'rgb(4, 5, 6)' },
        ],
      }),
    );
    expect(legend.match(/<li/g)).toHaveLength(2);
    expect(legend).toContain('Rooms');
    expect(legend).toContain('rgb(4, 5, 6)');
  });

  it('draws one bare value compactly, and named series a row each', () => {
    const single = html(
      h(ChartTooltip, {
        title: 'Jan',
        rows: [{ value: '60.4k', color: 'red' }],
      }),
    );
    expect(drawn(single, 'SolarChartTooltip--swatch')).toBe(true);
    expect(drawn(single, 'SolarChartTooltip--rowSwatch')).toBe(false);
    const multi = html(
      h(ChartTooltip, {
        title: 'Jan',
        rows: [
          { label: 'Rooms', value: '12', color: 'red' },
          { label: 'Devices', value: '48', color: 'blue' },
        ],
      }),
    );
    expect(drawn(multi, 'SolarChartTooltip--rowSwatch')).toBe(true);
    expect(multi).toContain('Devices');
    expect(multi).toContain('48');
  });
});

describe('the SOLAR Bar Stack shell', () => {
  it('draws a Bar per segment, each growing by its share', () => {
    const stack = html(
      h(BarStack, {
        segments: [
          { value: 3, color: 'feedback-danger-strong' },
          { value: 1, color: 'feedback-neutral-subtle' },
        ],
      }),
    );
    expect(stack.match(/aria-hidden="true"/g).length).toBeGreaterThanOrEqual(1);
    expect(stack).toContain('flex:3 1 0');
    expect(stack).toContain('flex:1 1 0');
    expect(stack).toContain('--solar-color-surface-feedback-danger-strong');
  });
});

describe('the SOLAR charts', () => {
  it('render as a named figure, the legend under several series', () => {
    const chart = html(
      h(BarChart, {
        categories: ['Jan', 'Feb'],
        series: [
          { label: 'Rooms', data: [1, 2] },
          { label: 'Devices', data: [3, 4] },
        ],
        label: 'By month',
      }),
    );
    expect(chart).toContain('role="figure"');
    expect(chart).toContain('aria-label="By month"');
    expect(
      drawn(chart, 'SolarDataLegend-label') || chart.includes('Devices'),
    ).toBe(true);
    const donut = html(
      h(DonutChart, {
        segments: [{ label: 'Good', value: 1 }],
        total: '100',
        totalLabel: 'Total',
      }),
    );
    expect(donut).toContain('100');
    expect(donut).toContain('Total');
  });
});
