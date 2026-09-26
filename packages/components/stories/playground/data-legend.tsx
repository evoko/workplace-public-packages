/**
 * Data Legend's Playground: its direction from its control; the `items` extra's number of sample
 * series (samples.ts), the first named by the `label` control (cleared, its sample name), each in
 * the SOLAR chart theme's colour for its place, as a SOLAR chart colours its series.
 */

import { DataLegend, type DataLegendProps } from '../../src/DataLegend.js';
import { seriesColor } from './charts.js';
import { series } from './samples.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const first = p.words('label');
    return (
      <DataLegend
        direction={p.choice<NonNullable<DataLegendProps['direction']>>(
          'direction',
        )}
        items={series.slice(0, p.whole('items')).map((name, i) => ({
          label: i === 0 && first ? first : name,
          color: seriesColor(i),
        }))}
      />
    );
  },
} satisfies PlaygroundBuilder;
