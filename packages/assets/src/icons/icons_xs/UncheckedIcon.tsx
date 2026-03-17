import { SvgIcon, SvgIconProps, useTheme } from '@mui/material';

export function UncheckedIcon(props: SvgIconProps) {
  const theme = useTheme();

  return (
    <SvgIcon {...props}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="0.5"
          y="0.5"
          width="15"
          height="15"
          rx="3.5"
          stroke={theme.palette.text.primary}
          strokeOpacity="0.4"
        />
      </svg>
    </SvgIcon>
  );
}
