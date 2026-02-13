import {
  Box,
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
    <Stack width="48px" height="100%" sx={{ mx: 2.5, ...sx }} {...props}>
      <Stack height="100%">{children}</Stack>
      {bottomLogoIcon ?? (
        <BiampLogoIcon sx={{ width: '48px', height: '15px' }} />
      )}
    </Stack>
  );
}

type BiampSidebarIconList = StackProps & {
  children: React.ReactNode;
};

export function BiampSidebarIconList({
  children,
  sx,
  ...props
}: BiampSidebarIconList) {
  return (
    <Stack height="100%" sx={{ gap: '4px', ...sx }} {...props}>
      {children}
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

type BiampSidebarComponentProps = ListItemButtonProps & {
  children: React.ReactNode;
};

export function BiampSidebarComponent({
  children,
  sx,
  ...props
}: BiampSidebarComponentProps) {
  return (
    <Box
      sx={{
        minWidth: '48px',
        maxWidth: '48px',
        minHeight: '48px',
        maxHeight: '48px',
        borderRadius: '8px',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}
