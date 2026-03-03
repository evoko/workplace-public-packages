import { SvgIcon, SvgIconProps } from '@mui/material';

export function ChevronLeft(props: SvgIconProps) {
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
          d="M10.5657 3.43433C10.8781 3.74675 10.8781 4.25328 10.5657 4.5657L7.13137 8.00001L10.5657 11.4343C10.8781 11.7467 10.8781 12.2533 10.5657 12.5657C10.2533 12.8781 9.74673 12.8781 9.43431 12.5657L5.43431 8.5657C5.28428 8.41567 5.2 8.21218 5.2 8.00001C5.2 7.78784 5.28428 7.58436 5.43431 7.43433L9.43431 3.43433C9.74673 3.12191 10.2533 3.12191 10.5657 3.43433Z"
          fill="currentColor"
        />
      </svg>
    </SvgIcon>
  );
}
