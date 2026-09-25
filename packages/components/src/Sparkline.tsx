/**
 * SOLAR Sparkline.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarSparklineTree` and `solarSparklineSlots` beside the recipe. What it looks like is not here.
 * That is the recipe, `solarSparklineStyle` and `solarSparklineCompose` in `@bwp-web/styles/mui`:
 * the frame, the line's box, and its stroke's colour and width, by trend and size.
 *
 * A tiny inline trend, as the description says, drawn from Figma's layer tree
 * (`internal/layers.tsx`): no axes or chrome, the line in its `trend`'s colour, `size` sm or md.
 * Given `data`, the values are drawn as a line scaled into the line's box, first to last, the
 * highest at its top, and the trend follows from them where none is given: up where the last is
 * above the first, down where below, flat otherwise (owner decision). Without data it draws
 * Figma's sample line. It is an image, named by `label`. The app must load
 * `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef } from 'react';
import {
  solarSparklineCompose,
  solarSparklineStyle,
  type SolarSparklineProps,
  solarSparklineSlots,
  solarSparklineTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

export interface SparklineProps
  extends
    SolarSparklineProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarSparklineProps | 'children' | 'ref'> {
  /** The values, first to last; without them it draws Figma's sample. */
  data?: readonly number[];
  /** What it shows, for a screen reader ("Revenue, rising"). */
  label?: string;
}

/** The trend a series shows: its last value against its first. */
export function trendOf(data: readonly number[]): 'up' | 'down' | 'flat' {
  if (data.length < 2) return 'flat';
  const d = data[data.length - 1]! - data[0]!;
  return d > 0 ? 'up' : d < 0 ? 'down' : 'flat';
}

/** The series as a path in a box: first to last across it, the highest at its top. */
export function sparklinePath(
  data: readonly number[],
  width: number,
  height: number,
): string {
  if (data.length === 0) return '';
  const min = Math.min(...data);
  const max = Math.max(...data);
  const x = (i: number) =>
    data.length === 1 ? width / 2 : (i * width) / (data.length - 1);
  const y = (v: number) =>
    max === min ? height / 2 : height - ((v - min) / (max - min)) * height;
  const n = (v: number) => String(Math.round(v * 100) / 100);
  return data
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${n(x(i))} ${n(y(v))}`)
    .join('');
}

type Glyph = { width: number; height: number };

export const Sparkline = forwardRef<HTMLDivElement, SparklineProps>(
  function Sparkline(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarSparkline), under the caller's own.
    const { trend, size, data, label, sx, ...rest } = useSolarProps(
      inProps,
      'SolarSparkline',
    );
    const look = { trend: trend ?? (data ? trendOf(data) : undefined), size };
    const composed = solarSparklineCompose(look);
    const figma = composed.line?.glyph as Glyph | undefined;
    // The data's line in the line's box, a path its stroke draws (the recipe's colour and width).
    const parts =
      data && figma
        ? {
            ...composed,
            line: {
              ...composed.line,
              glyph: {
                width: figma.width,
                height: figma.height,
                fill: [
                  {
                    d: sparklinePath(data, figma.width, figma.height),
                    evenOdd: false,
                  },
                ],
                stroke: [],
              },
            },
          }
        : composed;
    return (
      <Box
        ref={ref}
        role="img"
        aria-label={label}
        {...rest}
        sx={[solarSparklineStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: 'SolarSparkline',
          tree: solarSparklineTree,
          slots: solarSparklineSlots,
          parts,
        })}
      </Box>
    );
  },
);
