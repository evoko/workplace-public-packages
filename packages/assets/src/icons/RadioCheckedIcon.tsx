import { SvgIcon, SvgIconProps } from '@mui/material';

interface RadioCheckedIconProps extends SvgIconProps {
  ringColor?: string;
  dotColor?: string;
}

export function RadioCheckedIcon({
  ringColor,
  dotColor,
  ...props
}: RadioCheckedIconProps) {
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
          stroke={ringColor ?? 'currentColor'}
          strokeWidth="1"
          fill="none"
        />
        <circle
          className="radio-dot"
          cx="9"
          cy="9"
          r="5"
          fill={dotColor ?? 'currentColor'}
        />
      </svg>
    </SvgIcon>
  );
}
