import React from 'react';
import Box, { BoxProps } from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

export type BiampWrapperProps = BoxProps & {
  children?: React.ReactNode;
  /**
   * Background color of the outer container.
   * Defaults to `grey.100` in light mode and `grey.900` in dark mode.
   */
  background?: string;
};

/**
 * A full-page content wrapper that stretches to fill all available space
 * with a configurable background and responsive padding around the content.
 * Mobile: 16px, Desktop: 20px.
 */
export function BiampWrapper({
  children,
  background,
  sx,
  ...props
}: BiampWrapperProps) {
  const theme = useTheme();
  const defaultBg =
    theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100];

  return (
    <Box
      display="flex"
      flexDirection="column"
      sx={{
        height: '100%',
        padding: { xs: '16px', md: '20px' },
        backgroundColor: background ?? defaultBg,
        ...sx,
      }}
      {...props}
    >
      <Box
        sx={{
          borderRadius: '8px',
          overflow: 'auto',
          backgroundColor: 'background.default',
          flexGrow: 1,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
