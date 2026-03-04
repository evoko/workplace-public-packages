import { Box, type BoxProps } from '@mui/material';

export type BiampTableToolbarProps = BoxProps;

export function BiampTableToolbar({
  children,
  ...props
}: BiampTableToolbarProps) {
  return (
    <Box
      role="toolbar"
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      gap={1}
      {...props}
    >
      {children}
    </Box>
  );
}
