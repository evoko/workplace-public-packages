import oracle from '../../../../../spec/verify/agenda-row.json';
import { AgendaRow, type AgendaRowProps } from '../../../src/AgendaRow.js';
import { Avatar } from '../../../src/Avatar.js';
import type { VisualCase } from './types.js';

// Each state and density with Figma's words and times, its dot in the recipe's colour (Figma binds
// it to data/category/06/strong, which follows the mode where a sampled colour would not), and the
// attendee Figma draws (an md Avatar with initials, in the purple its
// own check samples), pressable so a hover is reached as a user reaches it, in Figma's 560 (it
// fills its list).
export default {
  oracle,
  render: (v) => (
    <div style={{ width: 560 }}>
      <AgendaRow
        selected={
          (v.props as Pick<AgendaRowProps, 'selected' | 'density'>).selected
        }
        density={
          (v.props as Pick<AgendaRowProps, 'selected' | 'density'>).density
        }
        data-case-root=""
        title="Team standup"
        start="9:00"
        end="10:00"
        meta="Conference room A · 6 attendees"
        attendee={
          <Avatar size="md" type="text" color="#f4edff" name="Dana Scully" />
        }
        onClick={() => {}}
      />
    </div>
  ),
} satisfies VisualCase;
