import { SvgIcon, SvgIconProps, useTheme } from '@mui/material';

export function InfoStatusIcon(props: SvgIconProps) {
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
        <g filter="url(#filter0_d_184_2382)">
          <path
            d="M6.27393 6.24255C6.27393 5.91118 6.54256 5.64255 6.87393 5.64255L7.1066 5.64255C7.43705 5.64255 7.7053 5.90975 7.7066 6.24019L7.72336 10.5047C7.72467 10.8371 7.45546 11.1073 7.12303 11.1071L6.87359 11.1069C6.54235 11.1068 6.27393 10.8382 6.27393 10.5069L6.27393 6.24255ZM7.87988 3.80564C7.87988 4.14223 7.78857 4.37855 7.60596 4.51462C7.41976 4.65069 7.19596 4.71872 6.93457 4.71872C6.68034 4.71872 6.46191 4.65069 6.2793 4.51462C6.0931 4.37855 6 4.14223 6 3.80564C6 3.48337 6.0931 3.25062 6.2793 3.1074C6.46191 2.96417 6.68034 2.89255 6.93457 2.89255C7.19596 2.89255 7.41976 2.96417 7.60596 3.1074C7.78857 3.25062 7.87988 3.48337 7.87988 3.80564Z"
            fill="white"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_184_2382"
            x="5"
            y="2.49258"
            width="3.87988"
            height="10.2144"
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
              result="effect1_dropShadow_184_2382"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_184_2382"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
    </SvgIcon>
  );
}
