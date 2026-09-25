/**
 * SOLAR Chart Tooltip.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarChartTooltipTree` and `solarChartTooltipSlots` beside the recipe. What it looks like is
 * not here. That is the recipe, `solarChartTooltipStyle` and `solarChartTooltipCompose` in
 * `@bwp-web/styles/mui`: the surface, its rows and its words' text styles, single or multi.
 *
 * A chart's value on hover, as the description says, drawn from Figma's layer tree
 * (`internal/layers.tsx`): the point's `title` and a row per series (`rows`), each Figma's dot in
 * the series' `color`, its `label` and its `value`. Rows that name their series draw the multi
 * tooltip, a row each, their values at the end; one bare value the compact single one. The chart
 * shows and hides it (the SOLAR charts, or a library's tooltip slot). The app must load
 * `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef, type ReactNode } from 'react';
import {
  solarChartTooltipCompose,
  solarChartTooltipStyle,
  solarChartTooltipSlots,
  solarChartTooltipTree,
} from '@bwp-web/styles/mui';
import { drawLayer } from './internal/layers.js';
import {
  StatusIndicator,
  type StatusIndicatorProps,
} from './StatusIndicator.js';

/** One series at the point: its name (for several), its value, formatted, and its colour. */
export interface ChartTooltipRow {
  label?: ReactNode;
  value: ReactNode;
  color: string;
}

export interface ChartTooltipProps extends Omit<
  BoxProps,
  'children' | 'title' | 'ref'
> {
  /** The point's title: its category or date ("Jan 2026"). */
  title: ReactNode;
  /** The series at the point, in the chart's order. */
  rows: readonly ChartTooltipRow[];
}

const P = 'SolarChartTooltip';

export const ChartTooltip = forwardRef<HTMLDivElement, ChartTooltipProps>(
  function ChartTooltip(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarChartTooltip), under the caller's own.
    const { title, rows, sx, ...rest } = useSolarProps(
      inProps,
      'SolarChartTooltip',
    );
    // Its series follows from what it is given: rows that name their series are the multi one.
    const series = rows.some((r) => r.label != null)
      ? ('multi' as const)
      : ('single' as const);
    const look = { series };
    const parts = solarChartTooltipCompose(look);
    const d = {
      prefix: P,
      tree: solarChartTooltipTree,
      slots: solarChartTooltipSlots,
      parts,
    };
    const dot = (layer: string, color: string) => {
      const p = parts[layer] as Record<string, unknown>;
      return function Dot({
        className: cls,
        style,
      }: {
        className: string;
        style?: object;
      }) {
        return (
          <span className={cls} style={style} aria-hidden>
            <StatusIndicator
              type={p['variant.type'] as StatusIndicatorProps['type']}
              size={p['variant.size'] as StatusIndicatorProps['size']}
              sx={{ backgroundColor: color }}
            />
          </span>
        );
      };
    };
    return (
      <Box
        ref={ref}
        {...rest}
        sx={[solarChartTooltipStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawLayer('title', { ...d, text: { title } })}
        {rows.map((row, i) => (
          <Box key={i} sx={{ display: 'contents' }}>
            {drawLayer('frame', {
              ...d,
              text: { frameValue: row.value, frameFrameLabel: row.label },
              render: {
                swatch: dot('swatch', row.color),
                rowSwatch: dot('rowSwatch', row.color),
              },
            })}
          </Box>
        ))}
      </Box>
    );
  },
);
