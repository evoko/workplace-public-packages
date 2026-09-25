import oracle from '../../../../../spec/verify/all-day-bar.json';
import { AllDayBar, type AllDayBarProps } from '../../../src/AllDayBar.js';
import type { VisualCase } from './types.js';

type Root = { root: { width?: number } };

// Each variant and span with Figma's words and time, at the width Figma draws the span (it fills
// the columns it spans).
export default {
  oracle,
  render: (v) => (
    <div style={{ width: (v.layers as Root).root.width }}>
      <AllDayBar
        {...(v.props as Pick<AllDayBarProps, 'variant' | 'span'>)}
        data-case-root=""
        title="Conference week"
        time="All day"
      />
    </div>
  ),
} satisfies VisualCase;
