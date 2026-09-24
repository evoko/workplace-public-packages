import oracle from '../../../../../spec/verify/timestamp.json';
import { Timestamp, type TimestampProps } from '../../../src/Timestamp.js';
import type { VisualCase } from './types.js';

// Figma's own sample words; the format changes the words, not the look.
export default {
  oracle,
  render: (v) => (
    <Timestamp
      {...(v.props as Omit<TimestampProps, 'dateTime' | 'children'>)}
      dateTime="2026-04-18T14:32:00Z"
      detail="Apr 18, 2026, 14:32"
    >
      2 min ago
    </Timestamp>
  ),
} satisfies VisualCase;
