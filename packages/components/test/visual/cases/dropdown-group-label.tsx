import MenuList from '@mui/material/MenuList';
import oracle from '../../../../../spec/verify/dropdown-group-label.json';
import {
  DropdownGroupLabel,
  type DropdownGroupLabelProps,
} from '../../../src/DropdownGroupLabel.js';
import type { VisualCase } from './types.js';

// In a menu's list, as a heading always is, with Figma's words. The heading is the root measured.
export default {
  oracle,
  render: (v) => (
    <MenuList disablePadding>
      <DropdownGroupLabel
        {...(v.props as Pick<DropdownGroupLabelProps, 'size'>)}
        data-case-root
      >
        Group Label
      </DropdownGroupLabel>
    </MenuList>
  ),
} satisfies VisualCase;
