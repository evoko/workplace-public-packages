import { ListItemButton, ListItemButtonProps } from '@mui/material';
import { JSX } from 'react';

type BiampListIconProps = ListItemButtonProps & {
  selected?: boolean;
  icon: JSX.Element;
  selectedIcon?: JSX.Element;
};

export function BiampListIcon({
  selected,
  icon,
  selectedIcon,
  sx,
  ...props
}: BiampListIconProps) {
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
