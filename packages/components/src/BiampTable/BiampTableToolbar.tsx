import { Box, type BoxProps } from '@mui/material';
import { mergeSx } from '../slotProps';

export type BiampTableToolbarProps = BoxProps;

export function BiampTableToolbar({
  children,
  sx,
  ...props
}: BiampTableToolbarProps) {
  return (
    <Box
      role="toolbar"
      {...props}
      sx={mergeSx(
        {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: { xs: 0, md: 1 },
          width: '100%',
          minHeight: 44,
        },
        sx,
      )}
    >
      {children}
    </Box>
  );
}
