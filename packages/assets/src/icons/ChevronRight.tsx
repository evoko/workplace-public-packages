import { SvgIcon, SvgIconProps } from '@mui/material';

export function ChevronRight(props: SvgIconProps) {
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
          d="M5.43433 3.43427C5.74675 3.12185 6.25328 3.12185 6.5657 3.43427L10.5657 7.43427C10.8781 7.74669 10.8781 8.25322 10.5657 8.56564L6.5657 12.5656C6.25328 12.8781 5.74675 12.8781 5.43433 12.5656C5.12191 12.2532 5.12191 11.7467 5.43433 11.4343L8.86864 7.99995L5.43433 4.56564C5.12191 4.25322 5.12191 3.74669 5.43433 3.43427Z"
          fill="currentColor"
        />
      </svg>
    </SvgIcon>
  );
}
