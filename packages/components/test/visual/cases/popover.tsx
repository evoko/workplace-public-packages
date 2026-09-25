import oracle from '../../../../../spec/verify/popover.json';
import { Popover, type PopoverProps } from '../../../src/Popover.js';
import type { VisualCase } from './types.js';

// Each size and placement with Figma's words, the surface alone, in place.
export default {
  oracle,
  render: (v) => (
    <Popover
      {...(v.props as Pick<PopoverProps, 'size' | 'placement'>)}
      title="Popover Title"
      body="Popover content goes here. This is a short description."
    />
  ),
} satisfies VisualCase;
