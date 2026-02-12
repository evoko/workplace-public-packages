import { SvgIcon, SvgIconProps, useTheme } from '@mui/material';

export function ErrorStatusIcon(props: SvgIconProps) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <SvgIcon {...props}>
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="14" height="14" rx="7" fill="currentColor" />
        <rect
          x="0.3"
          y="0.3"
          width="13.4"
          height="13.4"
          rx="6.7"
          stroke={
            isDarkMode ? theme.palette.common.white : theme.palette.grey[900]
          }
          strokeOpacity="0.4"
          strokeWidth="0.6"
        />
        <g filter="url(#filter0_d_6343_5437)">
          <path
            d="M7.63564 7.68006C7.619 7.99884 7.35568 8.24878 7.03646 8.24878H6.86491C6.54569 8.24878 6.28236 7.99884 6.26572 7.68006L6.05444 3.6325C6.03652 3.28931 6.30996 3.00122 6.65362 3.00122H7.24775C7.5914 3.00122 7.86484 3.28931 7.84693 3.6325L7.63564 7.68006ZM6 10.0857C6 9.7491 6.09131 9.51278 6.27393 9.37671C6.46012 9.24064 6.68392 9.17261 6.94531 9.17261C7.19954 9.17261 7.41797 9.24064 7.60059 9.37671C7.78678 9.51278 7.87988 9.7491 7.87988 10.0857C7.87988 10.408 7.78678 10.6407 7.60059 10.7839C7.41797 10.9272 7.19954 10.9988 6.94531 10.9988C6.68392 10.9988 6.46012 10.9272 6.27393 10.7839C6.09131 10.6407 6 10.408 6 10.0857Z"
            fill="white"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_6343_5437"
            x="5"
            y="2.60122"
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
              result="effect1_dropShadow_6343_5437"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_6343_5437"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
    </SvgIcon>
  );
}
