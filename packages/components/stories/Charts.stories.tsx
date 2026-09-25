// Written by hand: the charts are drawn by MUI X Charts in SOLAR's chart theme (solarChartTheme),
// with Figma's sample data, for the eye. The per-variant check does not apply to a library's plot;
// the chart theme's own test stands for it.
import type { Meta, StoryObj } from '@storybook/react-vite';
import { BarChart } from '../src/BarChart.js';
import { DonutChart } from '../src/DonutChart.js';
import { LineChart } from '../src/LineChart.js';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const a = { label: 'Series A', data: [146, 190, 110, 220, 163, 134] };
const b = { label: 'Series B', data: [96, 140, 160, 120, 190, 150] };

export default { title: 'SOLAR charts/Charts' } satisfies Meta;

export const BarSimple: StoryObj = {
  render: () => (
    <BarChart categories={months} series={[a]} label="Sessions by month" />
  ),
};
export const BarGrouped: StoryObj = {
  render: () => (
    <BarChart categories={months} series={[a, b]} label="Sessions by month" />
  ),
};
export const BarStacked: StoryObj = {
  render: () => (
    <BarChart
      categories={months}
      series={[a, b]}
      stacked
      label="Sessions by month"
    />
  ),
};
export const BarHorizontal: StoryObj = {
  render: () => (
    <BarChart
      categories={months}
      series={[a]}
      orientation="horizontal"
      label="Sessions by month"
    />
  ),
};
export const LineMulti: StoryObj = {
  render: () => (
    <LineChart categories={months} series={[a, b]} label="Sessions by month" />
  ),
};
export const Donut: StoryObj = {
  render: () => (
    <DonutChart
      total="100"
      totalLabel="Total"
      segments={[
        { label: 'Good', value: 60 },
        { label: 'Warning', value: 25 },
        { label: 'Bad', value: 15 },
      ]}
      label="Rooms by status"
    />
  ),
};
