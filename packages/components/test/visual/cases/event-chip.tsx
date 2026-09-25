import oracle from '../../../../../spec/verify/event-chip.json';
import { EventChip, type EventChipProps } from '../../../src/EventChip.js';
import type { VisualCase } from './types.js';

// Each category and variant with Figma's words and time, repeating, so the icon its prop shows is
// drawn and checked too; it fills its width, so it is given Figma's 160.
export default {
  oracle,
  render: (v) => (
    <div style={{ width: 160 }}>
      <EventChip
        {...(v.props as Pick<EventChipProps, 'category' | 'variant'>)}
        data-case-root=""
        title="Event title"
        time="9:00"
        repeating
      />
    </div>
  ),
} satisfies VisualCase;
