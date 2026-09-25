import oracle from '../../../../../spec/verify/tooltip.json';
import { Tooltip, type TooltipProps } from '../../../src/Tooltip.js';
import type { VisualCase } from './types.js';

// Each size and position with Figma's word, the bubble alone, in place.
export default {
  oracle,
  render: (v) => (
    <Tooltip
      {...(v.props as Pick<TooltipProps, 'size' | 'position'>)}
      title="Label"
    />
  ),
} satisfies VisualCase;
