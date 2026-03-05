import { Box, type BoxProps } from '@mui/material';

export type BiampTableToolbarActionsProps = BoxProps;

export function BiampTableToolbarActions({
  children,
  ...props
}: BiampTableToolbarActionsProps) {
  return (
    <Box
      display="flex"
      alignItems="center"
      ml="auto"
      gap={{ xs: 0, md: 1 }}
      mr={{ xs: 1, md: 0 }}
      {...props}
    >
      {children}
    </Box>
  );
}
