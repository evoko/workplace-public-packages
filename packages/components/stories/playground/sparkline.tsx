/**
 * Sparkline's Playground: its trend and size from their controls; its values the `data` extra, its
 * numbers comma-separated, drawn first to last (words that are no number ignored; with none, Figma's
 * sample line). The trend is the control's, which colours the line whatever the values do, since
 * the shell takes it from the values only where none is given. Named "Trend".
 */

import { Sparkline, type SparklineProps } from '../../src/Sparkline.js';
import { numbersIn } from './charts.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const data = numbersIn(p.text('data'));
    return (
      <Sparkline
        trend={p.choice<NonNullable<SparklineProps['trend']>>('trend')}
        size={p.choice<NonNullable<SparklineProps['size']>>('size')}
        data={data.length ? data : undefined}
        label="Trend"
      />
    );
  },
} satisfies PlaygroundBuilder;
