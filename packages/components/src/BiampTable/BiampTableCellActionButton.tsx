import { IconButton, type IconButtonProps, Tooltip } from '@mui/material';
import type React from 'react';

export type BiampTableCellActionButtonProps<
  C extends React.ElementType = 'button',
> = {
  /** Tooltip label for the action button. */
  label: string;
  /** Icon to display inside the button. */
  icon: React.ReactNode;
} & IconButtonProps<C, { component?: C }>;

/** Icon button with a tooltip, designed for use inside table cell action columns. */
export function BiampTableCellActionButton<
  C extends React.ElementType = 'button',
>({ label, icon, ...props }: BiampTableCellActionButtonProps<C>) {
  return (
    <Tooltip
      title={label}
      placement="top"
      enterDelay={500}
      enterNextDelay={500}
      disableInteractive
    >
      <span>
        <IconButton aria-label={label} {...props}>
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );
}
