/**
 * Bar's Playground: its colour from its control. A bar fills the box its chart gives it, so it is
 * drawn in a box of the `thickness` and `length` extras (a column, as Figma draws it, at Figma's
 * 32 × 80 at first): the chart's data, not the bar's design.
 */

import { Bar, type BarProps } from '../../src/Bar.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <div
      style={{
        display: 'flex',
        width: `${p.whole('thickness')}px`,
        height: `${p.whole('length')}px`,
      }}
    >
      <Bar color={p.choice<NonNullable<BarProps['color']>>('color')} />
    </div>
  ),
} satisfies PlaygroundBuilder;
