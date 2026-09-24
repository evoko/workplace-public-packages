import oracle from '../../../../../spec/verify/dropdown.json';
import { Dropdown, type DropdownProps } from '../../../src/Dropdown.js';
import { DropdownItem } from '../../../src/DropdownItem.js';
import { icon } from './probes.js';
import type { VisualCase } from './types.js';

// Every slot filled so its look is measured: the label, starred, the helper and both icon probes;
// open where Figma draws it open (its panel, a Dropdown Menu, Figma does not draw), staying in the
// page without taking it over, as Select's case does.
export default {
  oracle,
  render: (v) => (
    <Dropdown
      {...(v.props as Pick<
        DropdownProps,
        'size' | 'open' | 'disabled' | 'error'
      >)}
      label="Label"
      mandatory
      helper="Helper text"
      placeholder="Label"
      leadingIcon={icon}
      trailingIcon={icon}
      MenuProps={{
        hideBackdrop: true,
        autoFocus: false,
        disableAutoFocus: true,
        disableEnforceFocus: true,
        disableRestoreFocus: true,
        disableScrollLock: true,
        slotProps: { root: { style: { pointerEvents: 'none' } } },
      }}
    >
      <DropdownItem value="one">Option</DropdownItem>
      <DropdownItem value="two">Option</DropdownItem>
    </Dropdown>
  ),
} satisfies VisualCase;
