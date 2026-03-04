import { SvgIcon, SvgIconProps } from '@mui/material';

export function DownloadIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
      >
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M4 16.2a.8.8 0 0 1 .8.8v2A1.2 1.2 0 0 0 6 20.2h12a1.2 1.2 0 0 0 1.2-1.2v-2a.8.8 0 1 1 1.6 0v2a2.8 2.8 0 0 1-2.8 2.8H6A2.8 2.8 0 0 1 3.2 19v-2a.8.8 0 0 1 .8-.8Z"
          clipRule="evenodd"
        />
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M6.434 10.434a.8.8 0 0 1 1.132 0L12 14.87l4.434-4.435a.8.8 0 1 1 1.132 1.132l-5 5a.8.8 0 0 1-1.132 0l-5-5a.8.8 0 0 1 0-1.132Z"
          clipRule="evenodd"
        />
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M12 3.2a.8.8 0 0 1 .8.8v12a.8.8 0 0 1-1.6 0V4a.8.8 0 0 1 .8-.8Z"
          clipRule="evenodd"
        />
      </svg>
    </SvgIcon>
  );
}
