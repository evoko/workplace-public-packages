import oracle from '../../../../../spec/verify/sparkline.json';
import { Sparkline, type SparklineProps } from '../../../src/Sparkline.js';
import type { VisualCase } from './types.js';

// Each trend and size with no data: Figma's sample line, which the check compares as Figma draws it.
export default {
  oracle,
  render: (v) => (
    <Sparkline
      {...(v.props as Pick<SparklineProps, 'trend' | 'size'>)}
      label="Trend"
    />
  ),
} satisfies VisualCase;
