import MenuList from '@mui/material/MenuList';
import oracle from '../../../../../spec/verify/context-menu-item.json';
import {
  ContextMenuItem,
  type ContextMenuItemProps,
} from '../../../src/ContextMenuItem.js';
import { icon } from './probes.js';
import type { VisualCase } from './types.js';

// In a menu, as a row always is (MUI's MenuItem needs one), with every slot filled: both icons
// and the shortcut. The row is the root measured.
export default {
  oracle,
  render: (v) => (
    <MenuList disablePadding>
      <ContextMenuItem
        {...(v.props as Pick<ContextMenuItemProps, 'disabled' | 'destructive'>)}
        leadingIcon={icon}
        trailingIcon={icon}
        shortcut="⌘K"
        data-case-root
      >
        Action
      </ContextMenuItem>
    </MenuList>
  ),
} satisfies VisualCase;
