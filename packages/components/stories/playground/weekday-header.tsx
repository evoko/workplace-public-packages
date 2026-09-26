/**
 * Weekday Header's Playground: a column header of a calendar's grid, drawn in a grid's row of its
 * own; its emphasis and words from their controls.
 */

import {
  WeekdayHeader,
  type WeekdayHeaderProps,
} from '../../src/WeekdayHeader.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <div role="grid" aria-label="October 2026">
      <div role="row">
        <WeekdayHeader
          emphasis={p.choice<NonNullable<WeekdayHeaderProps['emphasis']>>(
            'emphasis',
          )}
        >
          {p.text('label')}
        </WeekdayHeader>
      </div>
    </div>
  ),
} satisfies PlaygroundBuilder;
