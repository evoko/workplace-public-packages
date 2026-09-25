/**
 * What the SOLAR charts share (BarChart, LineChart, DonutChart): MUI X Charts drawn in SOLAR's
 * chart theme, `solarChartTheme` from `@bwp-web/styles/mui` (generated from the chart IRs), and
 * SOLAR's own Chart Tooltip as the library's tooltip.
 */

import { solarChartTheme } from '@bwp-web/styles/mui';
import {
  ChartsTooltipContainer,
  useAxesTooltip,
  useItemTooltip,
} from '@mui/x-charts/ChartsTooltip';
import { ChartTooltip } from '../ChartTooltip.js';

const t = solarChartTheme;

/** The axis, its ticks and labels, the gridlines and the lines, in the theme, by MUI X's classes. */
export const chartSx = {
  '& .MuiChartsAxis-line': {
    stroke: t.axis.line,
    strokeWidth: t.axis.lineWidth,
  },
  '& .MuiChartsAxis-tick': {
    stroke: t.axis.tick,
    strokeWidth: t.axis.tickWidth,
  },
  '& .MuiChartsAxis-tickLabel': { ...t.axis.label, fill: t.axis.label.color },
  '& .MuiChartsGrid-line': {
    stroke: t.grid.line,
    strokeWidth: t.grid.lineWidth,
  },
  '& .MuiLineElement-root': { strokeWidth: t.line.width },
} as const;

/** The theme's colour for the series at `i`, the palette repeating past its end. */
export const seriesColour = (i: number) => t.series[i % t.series.length]!;

/** The theme's colour for the donut segment at `i`. */
export const segmentColour = (i: number) => t.segments[i % t.segments.length]!;

/**
 * The tooltip at an axis value (a bar chart's category, a line chart's point): the value's title
 * and a row per series, named where there are several.
 */
export function AxisTooltip(props: { trigger?: 'axis' | 'item' | 'none' }) {
  const axes = useAxesTooltip();
  const at = axes?.[0];
  return (
    <ChartsTooltipContainer {...props} trigger="axis">
      {at ? (
        <ChartTooltip
          title={at.axisFormattedValue}
          rows={at.seriesItems.map((s) => ({
            label:
              at.seriesItems.length > 1
                ? (s.formattedLabel ?? undefined)
                : undefined,
            value: s.formattedValue,
            color: s.color,
          }))}
        />
      ) : null}
    </ChartsTooltipContainer>
  );
}

/** The tooltip on one item (a donut's segment): its name and its value. */
export function ItemTooltip(props: { trigger?: 'axis' | 'item' | 'none' }) {
  const item = useItemTooltip();
  return (
    <ChartsTooltipContainer {...props} trigger="item">
      {item ? (
        <ChartTooltip
          title={item.label ?? ''}
          rows={[{ value: item.formattedValue, color: item.color }]}
        />
      ) : null}
    </ChartsTooltipContainer>
  );
}
