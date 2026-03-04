import {
  Badge,
  type BadgeProps,
  IconButton,
  type IconButtonProps,
} from '@mui/material';
import type React from 'react';

export type BiampTableToolbarActionButtonProps = {
  /** Accessible label for the icon button. */
  label: string;
  /** Icon to display inside the button. */
  icon: React.ReactNode;
  /** Optional badge content. Shown as a dot indicator when provided. */
  badgeContent?: BadgeProps['badgeContent'];
} & Omit<IconButtonProps, 'children' | 'aria-label'>;

export function BiampTableToolbarActionButton({
  label,
  icon,
  badgeContent,
  ...props
}: BiampTableToolbarActionButtonProps) {
  return (
    <IconButton aria-label={label} {...props}>
      <Badge
        badgeContent={badgeContent}
        color="info"
        showZero={false}
        variant="dot"
        sx={{
          '& .MuiBadge-badge': {
            width: 6,
            height: 6,
            minWidth: 6,
            borderRadius: '50%',
            top: 0,
            right: -3,
          },
        }}
      >
        {icon}
      </Badge>
    </IconButton>
  );
}
