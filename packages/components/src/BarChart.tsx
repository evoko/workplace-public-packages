/**
 * SOLAR Bar Chart.
 *
 * Drawn by MUI X Charts (decision), in SOLAR's chart theme: `solarChartTheme` in
 * `@bwp-web/styles/mui`, generated from the chart IRs (Bar Chart, Chart Axis, Chart Gridlines,
 * Bar), so nothing of its look is here. Its series take the theme's series colours in order, its
 * axis, ticks, labels and gridlines the theme's, its tooltip is SOLAR's Chart Tooltip, and several
 * series are named in SOLAR's Data Legend under it.
 *
 * `categories` are the axis's values ("Jan"…), `series` one or more sets of values (grouped side
 * by side, or `stacked`), `orientation` vertical (columns) or horizontal (rows). `label` names the
 * chart for a screen reader. Figma's Bar Chart is its sample; the per-variant check does not apply
 * to a library's plot, which the theme's own test and the stories stand for.
 */

import Box, { type BoxProps } from '@mui/material/Box';
import { BarChart as MuiBarChart } from '@mui/x-charts/BarChart';
import { solarChartTheme } from '@bwp-web/styles/mui';
import { forwardRef } from 'react';
import { DataLegend } from './DataLegend.js';
import { AxisTooltip, chartSx, seriesColour } from './internal/chart.js';

/** One series: its name and its values, one per category. */
export interface ChartSeries {
  label: string;
  data: readonly (number | null)[];
}

export interface BarChartProps extends Omit<BoxProps, 'children' | 'ref'> {
  /** The axis's values, one per bar or group ("Jan", "Feb"…). */
  categories: readonly string[];
  /** One series (simple), or several (grouped side by side, or stacked). */
  series: readonly ChartSeries[];
  /** Columns (vertical) or rows (horizontal). */
  orientation?: 'vertical' | 'horizontal';
  /** Several series stacked into one bar each, rather than side by side. */
  stacked?: boolean;
  /** The plot's height, in pixels; it fills its width. */
  height?: number;
  /** What the chart shows, for a screen reader. */
  label?: string;
}

export const BarChart = forwardRef<HTMLDivElement, BarChartProps>(
  function BarChart(
    {
      categories,
      series,
      orientation = 'vertical',
      stacked = false,
      height = 320,
      label,
      sx,
      ...rest
    },
    ref,
  ) {
    const across = orientation === 'horizontal';
    const band = {
      scaleType: 'band' as const,
      data: [...categories],
      tickSize: solarChartTheme.axis.tickSize,
    };
    const value = { tickSize: solarChartTheme.axis.tickSize };
    return (
      <Box
        ref={ref}
        role="figure"
        aria-label={label}
        {...rest}
        sx={[...(Array.isArray(sx) ? sx : [sx])]}
      >
        <MuiBarChart
          height={height}
          layout={across ? 'horizontal' : 'vertical'}
          xAxis={[across ? value : band]}
          yAxis={[across ? band : value]}
          series={series.map((s, i) => ({
            data: [...s.data],
            label: s.label,
            color: seriesColour(i),
            ...(stacked ? { stack: 'total' } : {}),
          }))}
          grid={{ horizontal: !across, vertical: across }}
          borderRadius={solarChartTheme.bar.radius}
          hideLegend
          slots={{ tooltip: AxisTooltip }}
          sx={chartSx}
        />
        {series.length > 1 ? (
          <DataLegend
            items={series.map((s, i) => ({
              label: s.label,
              color: seriesColour(i),
            }))}
          />
        ) : null}
      </Box>
    );
  },
);
