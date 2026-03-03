import { SvgIcon, SvgIconProps } from '@mui/material';

export function MinimizeIcon(props: SvgIconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" {...props}>
      <path
        d="M6 10H10M10 10V6M10 10L4 4M18 14H14M14 14V18M14 14L20 20"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  );
}
