import oracle from '../../../../../spec/verify/time-slot.json';
import { TimeSlot, type TimeSlotProps } from '../../../src/TimeSlot.js';
import type { VisualCase } from './types.js';

// Each state and density, pressable, so its hover is reached as a user reaches it, in Figma's 160
// (it fills its column).
export default {
  oracle,
  render: (v) => (
    <div style={{ width: 160 }}>
      <TimeSlot
        {...(v.props as Pick<TimeSlotProps, 'selected' | 'density'>)}
        data-case-root=""
        onClick={() => {}}
      />
    </div>
  ),
} satisfies VisualCase;
