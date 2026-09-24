import oracle from '../../../../../spec/verify/fab.json';
import { FAB, type FABProps } from '../../../src/FAB.js';
import { icon } from './probes.js';
import type { VisualCase } from './types.js';

// Extended where the oracle's variant fills the label, as the type follows from it.
export default {
  oracle,
  render: (v) => (
    <FAB {...(v.props as Omit<FABProps, 'icon'>)} icon={icon} aria-label="Add">
      {v.content?.includes('label') ? 'Label' : undefined}
    </FAB>
  ),
} satisfies VisualCase;
