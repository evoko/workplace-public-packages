import { SvgIcon, SvgIconProps, useTheme } from '@mui/material';

export function WarningStatusIcon(props: SvgIconProps) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <SvgIcon {...props}>
      <svg
        width="16"
        height="14"
        viewBox="0 0 16 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7.47905 0.911655C7.70939 0.508566 8.29061 0.508566 8.52095 0.911655L15.487 13.1023C15.7156 13.5023 15.4268 14 14.9661 14H1.03391C0.573214 14 0.284394 13.5023 0.512962 13.1023L7.47905 0.911655Z"
          fill="currentColor"
        />
        <path
          d="M7.73926 1.06055C7.85443 0.859003 8.14557 0.859002 8.26074 1.06055L15.2266 13.251C15.3408 13.451 15.1962 13.7002 14.9658 13.7002H1.03418C0.803833 13.7002 0.659154 13.451 0.773438 13.251L7.73926 1.06055Z"
          stroke={
            isDarkMode ? theme.palette.common.white : theme.palette.grey[900]
          }
          strokeOpacity="0.4"
          strokeWidth="0.6"
        />
        <g filter="url(#filter0_d_184_2208)">
          <path
            d="M8.63564 8.67884C8.619 8.99762 8.35568 9.24756 8.03646 9.24756H7.86491C7.54569 9.24756 7.28236 8.99762 7.26572 8.67884L7.05444 4.63128C7.03652 4.28809 7.30996 4 7.65362 4H8.24775C8.5914 4 8.86484 4.28809 8.84693 4.63128L8.63564 8.67884ZM7 11.0845C7 10.7479 7.09131 10.5116 7.27393 10.3755C7.46012 10.2394 7.68392 10.1714 7.94531 10.1714C8.19954 10.1714 8.41797 10.2394 8.60059 10.3755C8.78678 10.5116 8.87988 10.7479 8.87988 11.0845C8.87988 11.4067 8.78678 11.6395 8.60059 11.7827C8.41797 11.9259 8.19954 11.9976 7.94531 11.9976C7.68392 11.9976 7.46012 11.9259 7.27393 11.7827C7.09131 11.6395 7 11.4067 7 11.0845Z"
            fill={
              isDarkMode ? theme.palette.grey[900] : theme.palette.common.white
            }
          />
        </g>
        <defs>
          <filter
            id="filter0_d_184_2208"
            x="6"
            y="3.6"
            width="3.87988"
            height="9.99756"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="0.6" />
            <feGaussianBlur stdDeviation="0.5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_184_2208"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_184_2208"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
    </SvgIcon>
  );
}
