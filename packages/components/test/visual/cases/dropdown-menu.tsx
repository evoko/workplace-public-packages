import oracle from '../../../../../spec/verify/dropdown-menu.json';
import { DropdownGroupLabel } from '../../../src/DropdownGroupLabel.js';
import { DropdownItem } from '../../../src/DropdownItem.js';
import {
  DropdownMenu,
  type DropdownMenuProps,
} from '../../../src/DropdownMenu.js';
import { icon } from './probes.js';
import type { OracleVariant, VisualCase } from './types.js';

type ChildLayer = { component?: string };

/** The heading and rows Figma draws in the variant, in its order, each with its layer. */
const held = (v: OracleVariant) =>
  Object.entries(v.layers as Record<string, ChildLayer>).filter(
    ([, l]) =>
      l.component === 'Dropdown Item' || l.component === 'Dropdown Group Label',
  );

// Figma's heading and rows, in place (no anchor), every row's slots filled so its look is
// measured: the checkbox, an icon probe and the second line.
export default {
  oracle,
  render: (v) => (
    <DropdownMenu {...(v.props as Pick<DropdownMenuProps, 'size'>)}>
      {held(v).map(([name, l]) =>
        l.component === 'Dropdown Group Label' ? (
          <DropdownGroupLabel key={name} data-layer={name}>
            Group Label
          </DropdownGroupLabel>
        ) : (
          <DropdownItem
            key={name}
            data-layer={name}
            checkbox
            icon={icon}
            helper="Description"
          >
            Label
          </DropdownItem>
        ),
      )}
    </DropdownMenu>
  ),
} satisfies VisualCase;
