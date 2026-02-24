import { SvgIcon, SvgIconProps } from '@mui/material';

export function RadioUncheckedIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="radio-ring"
          cx="9"
          cy="9"
          r="8.5"
          stroke="currentColor"
          strokeWidth="1"
        />
      </svg>
    </SvgIcon>
  );
}
