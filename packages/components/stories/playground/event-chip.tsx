/**
 * Event Chip's Playground: its category, variant, time and title from their controls, a cleared
 * time left out; its `repeating` icon control stands for whether the event repeats, since the shell
 * draws its own icon: `_none` makes it a one-off. It fills the width box, as a chip fills its cell.
 * A styled part: what a click does is the app's, and it takes none.
 */

import { EventChip, type EventChipProps } from '../../src/EventChip.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <EventChip
      category={p.choice<NonNullable<EventChipProps['category']>>('category')}
      variant={p.choice<NonNullable<EventChipProps['variant']>>('variant')}
      time={p.words('time')}
      repeating={p.icon('repeating') !== undefined}
      title={p.text('title')}
    />
  ),
} satisfies PlaygroundBuilder;
