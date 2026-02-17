import { SvgIcon, SvgIconProps, useTheme } from '@mui/material';

export function SuccessStatusIcon(props: SvgIconProps) {
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
        <g filter="url(#filter0_d_6364_4478)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.0279 4.41561C10.3328 4.54591 10.6867 5.04261 10.4654 5.29062L6.9525 9.02403C6.57226 9.45014 6.38214 9.66319 6.13689 9.6656C5.89164 9.66802 5.69741 9.45876 5.30894 9.04023L3.58698 7.18499C3.45389 7.0416 3.42727 6.82846 3.52095 6.65639C3.65295 6.41394 3.96768 6.34523 4.18765 6.51085L5.37782 7.40696C5.7414 7.6807 5.92319 7.81758 6.12825 7.8043C6.3333 7.79102 6.49616 7.63184 6.82188 7.31346L9.59039 4.41562C9.72976 4.27939 9.84906 4.33918 10.0279 4.41561Z"
            fill={
              isDarkMode ? theme.palette.grey[900] : theme.palette.common.white
            }
          />
        </g>
        <defs>
          <filter
            id="filter0_d_6364_4478"
            x="2.46539"
            y="3.93435"
            width="9.06921"
            height="7.3313"
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
              values="0 0 0 0 0.0666667 0 0 0 0 0.0666667 0 0 0 0 0.0666667 0 0 0 0.2 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_6364_4478"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_6364_4478"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
    </SvgIcon>
  );
}
