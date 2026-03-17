import { Button, ButtonProps, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

type Props = ButtonProps & {
  children: React.ReactNode;
  active?: boolean;
  small?: boolean;
  component?: React.ElementType;
};

export function SegmentedButton({
  children,
  active,
  small,
  sx,
  ...props
}: Props) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const backgroundColor = active
    ? isDarkMode
      ? theme.palette.grey[900]
      : theme.palette.common.white
    : 'transparent';
  const textColor = active
    ? theme.palette.text.primary
    : theme.palette.text.secondary;
  const border = active ? 'solid' : undefined;
  return (
    <Button
      sx={{
        backgroundColor,
        color: textColor,
        borderRadius: '4px',
        border,
        borderColor: 'divider',
        lineHeight: 1.5,
        px: 1.5,
        py: 0,
        height: small ? '22px' : '26px',
        ...(small && { fontSize: '12px', letterSpacing: '-0.24px' }),
        boxShadow: active
          ? `0 1px 2px 0 ${alpha(theme.palette.common.black, 0.05)} !important`
          : 'none !important',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
