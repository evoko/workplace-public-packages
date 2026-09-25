/**
 * SOLAR Data Legend.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarDataLegendTree` and `solarDataLegendSlots` beside the recipe. What it looks like is not
 * here. That is the recipe, `solarDataLegendStyle` and `solarDataLegendCompose` in
 * `@bwp-web/styles/mui`: the legend's row or column, each item's, and its name's text style.
 *
 * A chart's legend, as the description says, drawn from Figma's layer tree
 * (`internal/layers.tsx`): one item per series the caller gives (`items`), each Figma's dot (the xs
 * StatusIndicator's shape and edge) in the series' `color` beside its `label`, in a row or a column
 * (`direction`). A list; the dots are decorative, the names say the series. The app must load
 * `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef, type ReactNode } from 'react';
import {
  solarDataLegendCompose,
  solarDataLegendStyle,
  type SolarDataLegendProps,
  solarDataLegendSlots,
  solarDataLegendTree,
} from '@bwp-web/styles/mui';
import { drawLayer } from './internal/layers.js';
import {
  StatusIndicator,
  type StatusIndicatorProps,
} from './StatusIndicator.js';

/** One series: its name and its colour (a CSS colour, the chart's, `var(--solar-color-data-…)`). */
export interface DataLegendItem {
  label: ReactNode;
  color: string;
}

export interface DataLegendProps
  extends
    SolarDataLegendProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarDataLegendProps | 'children' | 'ref'> {
  /** The series, in the chart's order. */
  items: readonly DataLegendItem[];
}

const P = 'SolarDataLegend';

export const DataLegend = forwardRef<HTMLUListElement, DataLegendProps>(
  function DataLegend(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarDataLegend), under the caller's own.
    const { direction, items, sx, ...rest } = useSolarProps(
      inProps,
      'SolarDataLegend',
    );
    const look = { direction };
    const parts = solarDataLegendCompose(look);
    const swatch = parts.swatch as Record<string, unknown>;
    return (
      <Box
        component="ul"
        ref={ref}
        {...rest}
        sx={[
          solarDataLegendStyle(look),
          { listStyle: 'none', margin: 0, padding: 0 },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {items.map((item, i) => (
          <Box component="li" key={i} sx={{ display: 'contents' }}>
            {drawLayer('item', {
              prefix: P,
              tree: solarDataLegendTree,
              slots: solarDataLegendSlots,
              parts,
              text: { label: item.label },
              render: {
                // Figma's dot, in the series' colour.
                swatch: ({ className: cls, style }) => (
                  <span className={cls} style={style} aria-hidden>
                    <StatusIndicator
                      type={
                        swatch['variant.type'] as StatusIndicatorProps['type']
                      }
                      size={
                        swatch['variant.size'] as StatusIndicatorProps['size']
                      }
                      sx={{ backgroundColor: item.color }}
                    />
                  </span>
                ),
              },
            })}
          </Box>
        ))}
      </Box>
    );
  },
);
