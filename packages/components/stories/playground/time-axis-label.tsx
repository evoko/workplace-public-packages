/**
 * Time Axis Label's Playground: a row header of a week or day grid, drawn in a grid's row of its
 * own; its emphasis, density and words from their controls.
 */

import {
  TimeAxisLabel,
  type TimeAxisLabelProps,
} from '../../src/TimeAxisLabel.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <div role="grid" aria-label="Week of October 5, 2026">
      <div role="row">
        <TimeAxisLabel
          emphasis={p.choice<NonNullable<TimeAxisLabelProps['emphasis']>>(
            'emphasis',
          )}
          density={p.choice<NonNullable<TimeAxisLabelProps['density']>>(
            'density',
          )}
        >
          {p.text('label')}
        </TimeAxisLabel>
      </div>
    </div>
  ),
} satisfies PlaygroundBuilder;
