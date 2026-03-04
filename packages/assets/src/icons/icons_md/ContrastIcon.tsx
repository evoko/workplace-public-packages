import { SvgIcon, SvgIconProps } from '@mui/material';

export function ContrastIcon(props: SvgIconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 12.1C3 17.3467 7.25329 21.6 12.5 21.6C17.7467 21.6 22 17.3467 22 12.1V11.5C22 6.25329 17.7467 2 12.5 2C7.25329 2 3 6.2533 3 11.5V12.1ZM20.4 11.5V12.1C20.4 16.2951 17.1301 19.7265 13 19.9844V3.61557C17.1301 3.87351 20.4 7.30489 20.4 11.5Z"
        fill="currentColor"
      />
    </SvgIcon>
  );
}
