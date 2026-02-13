import {
  ListItemButton,
  ListItemButtonProps,
  Stack,
  StackProps,
} from '@mui/material';
import { BiampLogoIcon } from '../icons';
import { JSX } from 'react';

type BiampSidebarProps = StackProps & {
  children: React.ReactNode;
  bottomLogoIcon?: JSX.Element;
};

export function BiampSidebar({
  children,
  bottomLogoIcon,
  sx,
  ...props
}: BiampSidebarProps) {
  return (
    <Stack width="48px" height="100%" sx={{ ...sx }} {...props}>
      <Stack height="100%">{children}</Stack>
      {bottomLogoIcon ?? (
        <BiampLogoIcon sx={{ width: '48px', height: '15px' }} />
      )}
    </Stack>
  );
}

type BiampSidebarIconProps = ListItemButtonProps & {
  selected?: boolean;
  icon: JSX.Element;
  selectedIcon?: JSX.Element;
};

export function BiampSidebarIcon({
  selected,
  icon,
  selectedIcon,
  sx,
  ...props
}: BiampSidebarIconProps) {
  const displayedSelectedIcon = selectedIcon ?? icon;
  return (
    <ListItemButton
      selected={selected}
      disableGutters
      disableRipple
      sx={{
        minWidth: '48px',
        maxWidth: '48px',
        minHeight: '48px',
        maxHeight: '48px',
        borderRadius: '8px',
        justifyContent: 'center',
        alignItems: 'center',
        ...sx,
      }}
      {...props}
    >
      {selected ? displayedSelectedIcon : icon}
    </ListItemButton>
  );
}
