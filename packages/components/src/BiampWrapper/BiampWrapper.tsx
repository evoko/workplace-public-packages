import React from 'react';
import { Box, LinearProgress, Stack, StackProps } from '@mui/material';
import { useLoadingDelay } from '../hooks';

export type BiampWrapperProps = StackProps & {
  loading?: boolean;
  children?: React.ReactNode;
};

/**
 * A full-page content wrapper that stretches to fill all available space
 * with 16px padding, 8px border radius, and scrollable overflow.
 * Background: white (light) / `grey.800` (dark).
 *
 * Optional `loading` shows a `LinearProgress` bar pinned to the top,
 * debounced via `useLoadingDelay` so fast loads don't flicker.
 */
export function BiampWrapper({
  loading = false,
  children,
  sx,
  ...props
}: BiampWrapperProps) {
  const showLoading = useLoadingDelay(loading);

  return (
    <Stack
      direction="column"
      padding="16px"
      sx={{
        position: 'relative',
        flex: 1,
        height: '100%',
        width: '100%',
        borderRadius: '8px',
        overflow: 'auto',
        overscrollBehavior: 'none',
        backgroundColor: ({ palette }) =>
          palette.mode === 'dark' ? palette.grey[800] : palette.common.white,
        ...sx,
      }}
      {...props}
    >
      {showLoading && (
        <Box
          sx={({ zIndex }) => ({
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            zIndex: zIndex.appBar + 1,
          })}
        >
          <LinearProgress />
        </Box>
      )}
      {children}
    </Stack>
  );
}
