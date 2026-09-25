import oracle from '../../../../../spec/verify/weekday-header.json';
import {
  WeekdayHeader,
  type WeekdayHeaderProps,
} from '../../../src/WeekdayHeader.js';
import type { VisualCase } from './types.js';

// Each emphasis with Figma's weekday, in Figma's 160 (it fills its column).
export default {
  oracle,
  render: (v) => (
    <div style={{ width: 160 }}>
      <WeekdayHeader
        {...(v.props as Pick<WeekdayHeaderProps, 'emphasis'>)}
        data-case-root=""
      >
        Mon
      </WeekdayHeader>
    </div>
  ),
} satisfies VisualCase;
