/**
 * Bar Stack's Playground: its orientation from its control; its segments' shares the `segments`
 * extra, numbers comma-separated (words that are no number, and shares not above 0, ignored), each in
 * Figma's sample colours in turn. A stack fills the box its chart gives it, so it is drawn in a box
 * of the `length` and `thickness` extras, along its orientation (Figma's 32 × 80 at first): the
 * chart's data, not the stack's design.
 */

import { BarStack, type BarStackProps } from '../../src/BarStack.js';
import { numbersIn } from './charts.js';
import type { PlaygroundBuilder } from './types.js';

/** Figma's sample breakdown's colours, first to last. */
const COLORS = [
  'feedback-danger-strong',
  'feedback-warning-medium',
  'feedback-info-medium',
  'feedback-neutral-subtle',
] as const;

export default {
  render: (p) => {
    const orientation =
      p.choice<NonNullable<BarStackProps['orientation']>>('orientation');
    const length = `${p.whole('length')}px`;
    const thickness = `${p.whole('thickness')}px`;
    const across = orientation === 'horizontal';
    return (
      <div
        style={{
          display: 'flex',
          width: across ? length : thickness,
          height: across ? thickness : length,
        }}
      >
        <BarStack
          orientation={orientation}
          segments={numbersIn(p.text('segments'))
            .filter((value) => value > 0)
            .map((value, i) => ({
              value,
              color: COLORS[i % COLORS.length]!,
            }))}
        />
      </div>
    );
  },
} satisfies PlaygroundBuilder;
