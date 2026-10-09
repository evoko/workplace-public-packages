import { Stack, StackProps, useTheme } from '@mui/material';
import { mergeSx } from '../slotProps';

type Props = StackProps & {
  children: React.ReactNode[];
  component?: React.ElementType;
};

export function SegmentedButtonGroup({ children, sx, ...props }: Props) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  return (
    <Stack
      direction="row"
      {...props}
      sx={mergeSx(
        {
          p: 0.5,
          borderRadius: '6px',
          gap: 1,
          backgroundColor: isDarkMode
            ? theme.palette.grey[900]
            : theme.palette.grey[100],
        },
        sx,
      )}
    >
      {children}
    </Stack>
  );
}
