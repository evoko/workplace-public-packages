import { Stack, StackProps } from '@mui/material';
import { mergeSx } from '../slotProps';

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
      {...props}
      sx={mergeSx(
        {
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          pt: { xs: 0, md: 1.5 },
          borderTop: withBorderTop
            ? ({ palette }) => `0.6px solid ${palette.divider}`
            : undefined,
          borderBottom: withBorderBottom
            ? ({ palette }) => `0.6px solid ${palette.divider}`
            : undefined,
        },
        sx,
      )}
    >
      {children}
    </Stack>
  );
}
