/**
 * SOLAR Donut Chart.
 *
 * Drawn by MUI X Charts' PieChart (decision), in SOLAR's chart theme: `solarChartTheme` in
 * `@bwp-web/styles/mui`, generated from the chart IRs (Donut Chart), so nothing of its look is
 * here. Its segments take the theme's segment colours in order (01 onwards, as Figma draws them),
 * its hole is Figma's (0.6 of its radius), its centre shows the caller's `total` and `totalLabel`
 * in the theme's text styles where given, and its tooltip is SOLAR's Chart Tooltip.
 *
 * `segments` are the parts of the whole, each named and valued. `label` names the chart for a
 * screen reader. Figma's Donut Chart is its sample; the per-variant check does not apply to a
 * library's plot, which the theme's own test and the stories stand for.
 */

import Box, { type BoxProps } from '@mui/material/Box';
import { PieChart } from '@mui/x-charts/PieChart';
import { solarChartTheme } from '@bwp-web/styles/mui';
import { forwardRef, type ReactNode } from 'react';
import { ItemTooltip, segmentColour } from './internal/chart.js';

/** One part of the whole: its name and its value. */
export interface DonutSegment {
  label: string;
  value: number;
}

export interface DonutChartProps extends Omit<BoxProps, 'children' | 'ref'> {
  /** The parts of the whole, in order. */
  segments: readonly DonutSegment[];
  /** The total in the centre ("100"), where given. */
  total?: ReactNode;
  /** The words under the total ("Total"). */
  totalLabel?: ReactNode;
  /** Its size, in pixels. */
  size?: number;
  /** What the chart shows, for a screen reader. */
  label?: string;
}

export const DonutChart = forwardRef<HTMLDivElement, DonutChartProps>(
  function DonutChart(
    { segments, total, totalLabel, size = 200, label, sx, ...rest },
    ref,
  ) {
    const t = solarChartTheme.donut;
    return (
      <Box
        ref={ref}
        role="figure"
        aria-label={label}
        {...rest}
        sx={[
          { position: 'relative', width: size, height: size },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <PieChart
          width={size}
          height={size}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          series={[
            {
              data: segments.map((s, i) => ({
                id: i,
                value: s.value,
                label: s.label,
                color: segmentColour(i),
              })),
              innerRadius: `${t.inner * 100}%`,
              outerRadius: '100%',
            },
          ]}
          hideLegend
          slots={{ tooltip: ItemTooltip }}
        />
        {total != null ? (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <Box component="span" sx={t.value}>
              {total}
            </Box>
            {totalLabel != null ? (
              <Box component="span" sx={t.label}>
                {totalLabel}
              </Box>
            ) : null}
          </Box>
        ) : null}
      </Box>
    );
  },
);
