import { Stack, StackProps, useTheme } from '@mui/material';

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
      p={0.5}
      borderRadius="6px"
      gap={1}
      sx={{
        backgroundColor: isDarkMode
          ? theme.palette.grey[800]
          : theme.palette.grey[100],
        ...sx,
      }}
      {...props}
    >
      {children}
    </Stack>
  );
}
