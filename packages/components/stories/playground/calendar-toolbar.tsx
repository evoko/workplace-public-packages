/**
 * Calendar Toolbar's Playground: its range from its control; its own previous, next and Today
 * buttons, each press logged (which range they go to is the app's); its view switcher, shown by the
 * `views` toggle, an sm Segmented Control of the sample views (Day, Week, Month, Agenda), the chosen
 * one the `view` extra, which choosing sets; its action, shown by the `action` toggle, an sm
 * secondary "New event" Button, its press logged.
 */

import { Button } from '../../src/Button.js';
import { CalendarToolbar } from '../../src/CalendarToolbar.js';
import { SegmentedControl } from '../../src/SegmentedControl.js';
import { SegmentedControlItem } from '../../src/SegmentedControlItem.js';
import type { PlaygroundBuilder } from './types.js';

/** The sample views, the `view` extra's options (packages/codegen/src/playground/extras.mjs). */
const VIEWS = ['Day', 'Week', 'Month', 'Agenda'];

export default {
  render: (p) => (
    <CalendarToolbar
      range={p.text('range')}
      onPrevious={() => p.log('onPrevious')}
      onNext={() => p.log('onNext')}
      onToday={() => p.log('onToday')}
      views={
        p.child('views').shown ? (
          <SegmentedControl
            size="sm"
            value={p.choice('view')}
            onChange={(_, value) => {
              p.set('view', value);
              p.log('onChange', value);
            }}
          >
            {VIEWS.map((v) => (
              <SegmentedControlItem key={v} value={v} size="sm">
                {v}
              </SegmentedControlItem>
            ))}
          </SegmentedControl>
        ) : undefined
      }
      action={
        p.child('action').shown ? (
          <Button
            size="sm"
            prio="secondary"
            onClick={() => p.log('onClick', 'New event')}
          >
            New event
          </Button>
        ) : undefined
      }
    />
  ),
} satisfies PlaygroundBuilder;
