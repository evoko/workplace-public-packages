import oracle from '../../../../../spec/verify/dropdown-menu.json';
import { DropdownGroupLabel } from '../../../src/DropdownGroupLabel.js';
import { DropdownItem } from '../../../src/DropdownItem.js';
import {
  DropdownMenu,
  type DropdownMenuProps,
} from '../../../src/DropdownMenu.js';
import type { OracleVariant, VisualCase } from './types.js';

type ChildLayer = { component?: string };

/** The heading and rows Figma draws in the variant, in its order, each with its layer. */
const held = (v: OracleVariant) =>
  Object.entries(v.layers as Record<string, ChildLayer>).filter(
    ([, l]) =>
      l.component === 'Dropdown Item' || l.component === 'Dropdown Group Label',
  );

// Figma's heading and rows, in place (no anchor), the rows as Figma's menu draws them: words alone,
// their checkbox, icon and second line hidden (the oracle's hides).
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
          <DropdownItem key={name} data-layer={name}>
            Label
          </DropdownItem>
        ),
      )}
    </DropdownMenu>
  ),
} satisfies VisualCase;
