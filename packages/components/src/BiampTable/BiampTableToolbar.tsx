import { Box, type BoxProps } from '@mui/material';

export type BiampTableToolbarProps = BoxProps;

export function BiampTableToolbar({
  children,
  sx,
  ...props
}: BiampTableToolbarProps) {
  return (
    <Box
      role="toolbar"
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      gap={{ xs: 0, md: 1 }}
      minHeight={44}
      pl={{ xs: 2, sm: 3, xl: 12.5 }}
      pr={{ xs: 0, md: 3, xl: 12.5 }}
      sx={{ ...sx }}
      {...props}
    >
      {children}
    </Box>
  );
}
