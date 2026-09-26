/**
 * Time Slot's Playground: a cell of a week or day grid, drawn in a grid's row of its own, named by
 * a sample hour; its state and density from their controls. A click chooses it, as an app's grid
 * chooses the cell it creates an event in: it is logged, and sets `selected`.
 */

import { TimeSlot, type TimeSlotProps } from '../../src/TimeSlot.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <div role="grid" aria-label="Week of October 5, 2026">
      <div role="row">
        <TimeSlot
          label="Monday 9 AM"
          selected={p.flag('selected')}
          density={p.choice<NonNullable<TimeSlotProps['density']>>('density')}
          onClick={() => {
            p.set('selected', true);
            p.log('onClick');
          }}
        />
      </div>
    </div>
  ),
} satisfies PlaygroundBuilder;
