import { Box, type BoxProps } from '@mui/material';

export type BiampTableToolbarActionsProps = BoxProps;

export function BiampTableToolbarActions({
  children,
  ...props
}: BiampTableToolbarActionsProps) {
  return (
    <Box display="flex" alignItems="center" gap={1} ml="auto" {...props}>
      {children}
    </Box>
  );
}
