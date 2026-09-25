import oracle from '../../../../../spec/verify/bar-stack.json';
import {
  BarStack,
  type BarStackProps,
  type BarStackSegment,
} from '../../../src/BarStack.js';
import type { VisualCase } from './types.js';

// Figma's sample breakdown, as many segments as the variant draws.
const sample: BarStackSegment[] = [
  { value: 24, color: 'feedback-danger-strong' },
  { value: 32, color: 'feedback-warning-medium' },
  { value: 20, color: 'feedback-info-medium' },
  { value: 48, color: 'feedback-neutral-subtle' },
];

// Each orientation and count, in Figma's 32 × 80 (80 × 32 across): it fills the box it is given.
export default {
  oracle,
  render: (v) => {
    const across =
      (v.props as Pick<BarStackProps, 'orientation'>).orientation ===
      'horizontal';
    const count = Number(/segments=(\d)/.exec(v.figma)?.[1] ?? 2);
    return (
      <div
        style={{
          width: across ? 80 : 32,
          height: across ? 32 : 80,
          display: 'flex',
        }}
      >
        <BarStack
          {...(v.props as Pick<BarStackProps, 'orientation'>)}
          data-case-root=""
          segments={sample.slice(4 - count)}
        />
      </div>
    );
  },
} satisfies VisualCase;
