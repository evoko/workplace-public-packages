import React from 'react';
import Box, { BoxProps } from '@mui/material/Box';

export type BiampWrapperProps = BoxProps & {
  children?: React.ReactNode;
};

/**
 * A full-page content wrapper that stretches to fill all available space
 * with 8px padding, 8px border radius, and scrollable overflow.
 * Background: white (light) / `grey.800` (dark).
 */
export function BiampWrapper({ children, sx, ...props }: BiampWrapperProps) {
  return (
    <Box
      display="flex"
      padding="8px"
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
    </Box>
  );
}
