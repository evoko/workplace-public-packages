import React from 'react';
import { Stack, StackProps } from '@mui/material';

export type BiampWrapperProps = StackProps & {
  children?: React.ReactNode;
};

/**
 * A full-page content wrapper that stretches to fill all available space
 * with 8px padding, 8px border radius, and scrollable overflow.
 * Background: white (light) / `grey.800` (dark).
 */
export function BiampWrapper({ children, sx, ...props }: BiampWrapperProps) {
  return (
    <Stack
      direction="column"
      padding="16px"
      alignItems="flex-start"
      sx={{
        flex: 1,
        height: '100%',
        width: '100%',
        borderRadius: '8px',
        overflow: 'auto',
        backgroundColor: ({ palette }) =>
          palette.mode === 'dark' ? palette.grey[800] : palette.common.white,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Stack>
  );
}
