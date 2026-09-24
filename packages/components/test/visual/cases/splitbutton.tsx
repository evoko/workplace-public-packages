import oracle from '../../../../../spec/verify/splitbutton.json';
import {
  SplitButton,
  type SplitButtonProps,
} from '../../../src/SplitButton.js';
import type { VisualCase } from './types.js';

// Figma's own label; the spec hovers, presses and focuses the control, and focus lands on its
// first half, the action.
export default {
  oracle,
  render: (v) => (
    <SplitButton
      {...(v.props as Omit<SplitButtonProps, 'children'>)}
      onClick={() => {}}
      onMenuOpen={() => {}}
    >
      Label
    </SplitButton>
  ),
} satisfies VisualCase;
