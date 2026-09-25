import oracle from '../../../../../spec/verify/calendar-toolbar.json';
import { Button } from '../../../src/Button.js';
import { CalendarToolbar } from '../../../src/CalendarToolbar.js';
import { segmentedControl } from './controls.js';
import type { VisualCase } from './types.js';

// Figma's range, its own previous, next and Today buttons, and what Figma composes on the right:
// the sm Segmented Control with the six segments its own check draws, and an sm secondary Button;
// in Figma's 1280 (it spans its view).
export default {
  oracle,
  render: () => (
    <div style={{ width: 1280 }}>
      <CalendarToolbar
        data-case-root=""
        range="October 5 – 11, 2026"
        onPrevious={() => {}}
        onNext={() => {}}
        onToday={() => {}}
        views={segmentedControl('sm')}
        action={
          <Button size="sm" prio="secondary">
            New event
          </Button>
        }
      />
    </div>
  ),
} satisfies VisualCase;
