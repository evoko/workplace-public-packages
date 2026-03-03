import { SvgIcon, SvgIconProps } from '@mui/material';

export function BadgeLiveIcon(props: SvgIconProps) {
  return (
    <SvgIcon viewBox="0 0 6 6" {...props}>
      <circle cx="3" cy="3" r="2" fill="currentColor" />
    </SvgIcon>
  );
}
