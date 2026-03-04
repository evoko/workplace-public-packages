import { SvgIcon, SvgIconProps } from '@mui/material';

export function IndeterminateIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <rect width="16" height="16" rx="4" fill="currentColor" />
        <path
          d="M2.87988 8C2.87988 7.44772 3.3276 7 3.87988 7H12.1199C12.6722 7 13.1199 7.44772 13.1199 8C13.1199 8.55228 12.6722 9 12.1199 9H3.87988C3.3276 9 2.87988 8.55228 2.87988 8Z"
          fill="white"
        />
      </svg>
    </SvgIcon>
  );
}
