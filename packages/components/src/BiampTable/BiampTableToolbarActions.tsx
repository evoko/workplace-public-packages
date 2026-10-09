import { Box, type BoxProps } from '@mui/material';
import { mergeSx } from '../slotProps';

export type BiampTableToolbarActionsProps = BoxProps;

export function BiampTableToolbarActions({
  children,
  ...props
}: BiampTableToolbarActionsProps) {
  return (
    <Box
      {...props}
      sx={mergeSx(
        {
          display: 'flex',
          alignItems: 'center',
          ml: 'auto',
          gap: { xs: 0, md: 1 },
          mr: { xs: 1, md: 0 },
        },
        props.sx,
      )}
    >
      {children}
    </Box>
  );
}
