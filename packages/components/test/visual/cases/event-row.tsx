import oracle from '../../../../../spec/verify/event-row.json';
import { Avatar } from '../../../src/Avatar.js';
import { EventRow } from '../../../src/EventRow.js';
import type { VisualCase } from './types.js';

// Figma's words and its leading Avatar (md, initials), a More menu, pressable so a hover and a
// focus are reached as a user reaches them; as wide as Figma draws it.
export default {
  oracle,
  render: () => (
    <EventRow
      leading={<Avatar size="md" type="text" name="Dana Scully" />}
      title="Event name"
      product="PRODUCT"
      meta="Context · Context · Context"
      timestamp="Just now"
      dateTime="2026-09-25T09:00:00Z"
      moreItems={[{ label: 'Details', onSelect: () => {} }]}
      onClick={() => {}}
      style={{ width: 520 }}
    />
  ),
} satisfies VisualCase;
