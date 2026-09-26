/**
 * Chart Tooltip's Playground: the point's title from its control; the `rows` extra's number of
 * series at the point, the first its `label` and `value` controls, the rest sample series and
 * values (samples.ts), each in the SOLAR chart theme's colour for its place. One row with no label
 * is the compact single tooltip, as the shell draws a bare value; named rows the multi one.
 */

import { ChartTooltip } from '../../src/ChartTooltip.js';
import { seriesColor } from './charts.js';
import { series, seriesValues } from './samples.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const label = p.words('label');
    const value = p.text('value');
    return (
      <ChartTooltip
        title={p.text('title')}
        rows={Array.from({ length: p.whole('rows') }, (_, i) =>
          i === 0
            ? { label, value, color: seriesColor(0) }
            : {
                label: series[i],
                value: seriesValues[i],
                color: seriesColor(i),
              },
        )}
      />
    );
  },
} satisfies PlaygroundBuilder;
