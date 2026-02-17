import { SvgIcon, SvgIconProps } from '@mui/material';

export function BreadcrumbIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.43427 3.43427C5.74669 3.12185 6.25322 3.12185 6.56564 3.43427L10.5656 7.43427C10.8781 7.74669 10.8781 8.25322 10.5656 8.56564L6.56564 12.5656C6.25322 12.8781 5.74669 12.8781 5.43427 12.5656C5.12185 12.2532 5.12185 11.7467 5.43427 11.4343L8.86858 7.99995L5.43427 4.56564C5.12185 4.25322 5.12185 3.74669 5.43427 3.43427Z"
          fill="currentColor"
        />
      </svg>
    </SvgIcon>
  );
}
