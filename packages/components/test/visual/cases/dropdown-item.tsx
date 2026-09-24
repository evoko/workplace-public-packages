import MenuList from '@mui/material/MenuList';
import oracle from '../../../../../spec/verify/dropdown-item.json';
import {
  DropdownItem,
  type DropdownItemProps,
} from '../../../src/DropdownItem.js';
import { icon } from './probes.js';
import type { VisualCase } from './types.js';

// In a menu, as a row always is (MUI's MenuItem needs one), with every slot filled: the checkbox,
// an icon probe and the second line. The row is the root measured.
export default {
  oracle,
  render: (v) => (
    <MenuList disablePadding>
      <DropdownItem
        {...(v.props as Pick<
          DropdownItemProps,
          'size' | 'selected' | 'disabled'
        >)}
        checkbox
        icon={icon}
        helper="Description"
        data-case-root
      >
        Label
      </DropdownItem>
    </MenuList>
  ),
} satisfies VisualCase;
