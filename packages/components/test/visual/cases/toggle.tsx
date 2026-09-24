import oracle from '../../../../../spec/verify/toggle.json';
import { Toggle, type ToggleProps } from '../../../src/Toggle.js';
import type { VisualCase } from './types.js';

// Named, as a toggle always is; controlled, so the variant's track is drawn whatever is clicked.
export default {
  oracle,
  render: (v) => (
    <Toggle
      {...(v.props as ToggleProps)}
      onChange={() => {}}
      slotProps={{ input: { 'aria-label': 'Setting' } }}
    />
  ),
} satisfies VisualCase;
