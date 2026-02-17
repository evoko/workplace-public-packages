import { SvgIcon, SvgIconProps } from '@mui/material';

export function InputCloseIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M17.5154 6.4848C17.8278 6.79722 17.8278 7.30375 17.5154 7.61617L7.61593 17.5157C7.30351 17.8281 6.79698 17.8281 6.48456 17.5157C6.17214 17.2032 6.17214 16.6967 6.48456 16.3843L16.3841 6.4848C16.6965 6.17238 17.203 6.17238 17.5154 6.4848Z"
          fill="currentColor"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.48456 6.4848C6.79698 6.17238 7.30351 6.17238 7.61593 6.4848L17.5154 16.3843C17.8278 16.6967 17.8278 17.2032 17.5154 17.5157C17.203 17.8281 16.6965 17.8281 16.3841 17.5157L6.48456 7.61617C6.17214 7.30375 6.17214 6.79722 6.48456 6.4848Z"
          fill="currentColor"
        />
      </svg>
    </SvgIcon>
  );
}
