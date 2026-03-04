import { Stack, StackProps } from '@mui/material';

export type BiampTableContainerProps = {
  /** Show a top border. @default true */
  withBorderTop?: boolean;
  /** Show a bottom border. @default false */
  withBorderBottom?: boolean;
} & StackProps;

export function BiampTableContainer({
  withBorderTop = true,
  withBorderBottom = false,
  children,
  sx,
  ...props
}: BiampTableContainerProps) {
  return (
    <Stack
      direction="column"
      height="100%"
      overflow="hidden"
      px={{ xs: 2, sm: 3, xl: 12.5 }}
      py={{ xs: 0, md: 1.5 }}
      gap={{ xs: 0, md: 1 }}
      borderTop={
        withBorderTop
          ? ({ palette }) => `0.6px solid ${palette.divider}`
          : undefined
      }
      borderBottom={
        withBorderBottom
          ? ({ palette }) => `0.6px solid ${palette.divider}`
          : undefined
      }
      sx={{ ...sx }}
      {...props}
    >
      {children}
    </Stack>
  );
}
