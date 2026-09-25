import oracle from '../../../../../spec/verify/time-axis-label.json';
import {
  TimeAxisLabel,
  type TimeAxisLabelProps,
} from '../../../src/TimeAxisLabel.js';
import type { VisualCase } from './types.js';

// Each emphasis and density with Figma's hour.
export default {
  oracle,
  render: (v) => (
    <TimeAxisLabel
      {...(v.props as Pick<TimeAxisLabelProps, 'emphasis' | 'density'>)}
    >
      9 AM
    </TimeAxisLabel>
  ),
} satisfies VisualCase;
