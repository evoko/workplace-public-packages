/**
 * SOLAR Line Chart.
 *
 * Drawn by MUI X Charts (decision), in SOLAR's chart theme: `solarChartTheme` in
 * `@bwp-web/styles/mui`, generated from the chart IRs (Line Chart, Chart Axis, Chart Gridlines),
 * so nothing of its look is here. Its series take the theme's series colours in order (Figma's
 * series A and B first) and its line stroke, its axis, ticks, labels and gridlines the theme's, its
 * tooltip is SOLAR's Chart Tooltip, and two or more series are named in SOLAR's Data Legend under
 * it, as Figma's multi chart names them.
 *
 * `categories` are the axis's values ("Jan"…), `series` one or more sets of values; no point
 * markers, as Figma draws none yet. `label` names the chart for a screen reader. Figma's Line Chart
 * is its sample; the per-variant check does not apply to a library's plot, which the theme's own
 * test and the stories stand for.
 */

import Box, { type BoxProps } from '@mui/material/Box';
import { LineChart as MuiLineChart } from '@mui/x-charts/LineChart';
import { solarChartTheme } from '@bwp-web/styles/mui';
import { forwardRef } from 'react';
import type { ChartSeries } from './BarChart.js';
import { DataLegend } from './DataLegend.js';
import { AxisTooltip, chartSx, seriesColour } from './internal/chart.js';

export interface LineChartProps extends Omit<BoxProps, 'children' | 'ref'> {
  /** The axis's values, one per point ("Jan", "Feb"…). */
  categories: readonly string[];
  /** One series or several, each a line. */
  series: readonly ChartSeries[];
  /** The plot's height, in pixels; it fills its width. */
  height?: number;
  /** What the chart shows, for a screen reader. */
  label?: string;
}

export const LineChart = forwardRef<HTMLDivElement, LineChartProps>(
  function LineChart(
    { categories, series, height = 240, label, sx, ...rest },
    ref,
  ) {
    return (
      <Box
        ref={ref}
        role="figure"
        aria-label={label}
        {...rest}
        sx={[...(Array.isArray(sx) ? sx : [sx])]}
      >
        <MuiLineChart
          height={height}
          xAxis={[
            {
              scaleType: 'point',
              data: [...categories],
              tickSize: solarChartTheme.axis.tickSize,
            },
          ]}
          yAxis={[{ tickSize: solarChartTheme.axis.tickSize }]}
          series={series.map((s, i) => ({
            data: [...s.data],
            label: s.label,
            color: seriesColour(i),
            showMark: false,
          }))}
          grid={{ horizontal: true }}
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
