import oracle from '../../../../../spec/verify/progressbar.json';
import {
  ProgressBar,
  type ProgressBarProps,
} from '../../../src/ProgressBar.js';
import type { VisualCase } from './types.js';

// At the value Figma draws each feedback at (its bar's share of the track), in Figma's 200px
// sample width, whose size the oracle excuses by the overlay's decision.
export default {
  oracle,
  render: (v) => {
    const bar = Number(v.layers?.indicator?.width);
    const track = Number(v.layers?.root?.width);
    return (
      <ProgressBar
        {...(v.props as Omit<ProgressBarProps, 'value'>)}
        value={(bar / track) * 100}
        aria-label="Progress"
        sx={{ width: track }}
      />
    );
  },
} satisfies VisualCase;
