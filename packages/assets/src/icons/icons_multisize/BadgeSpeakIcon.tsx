import { SvgIcon, SvgIconProps } from '@mui/material';
import { type ReactNode } from 'react';

type PathConfig = { viewBox: string; paths: ReactNode };
type IconVariant = 'xxxs' | 'xxxxs';

interface BadgeSpeakIconProps extends SvgIconProps {
  variant?: IconVariant;
}

const variantMap: Record<IconVariant, PathConfig> = {
  xxxs: {
    viewBox: '0 0 8 8',
    paths: (
      <>
        <path
          d="M1.04762 0C0.469905 0 0 0.510414 0 1.13793V4.86207C0 5.48959 0.469905 6 1.04762 6H6.95238C7.5301 6 8 5.48959 8 4.86207V1.13793C8 0.510414 7.5301 0 6.95238 0H1.04762Z"
          fill="currentColor"
        />
        <path
          d="M1.79077 7.60254V5.86286C1.79077 5.75839 1.87118 5.67151 1.97535 5.66346L4.58439 5.46165C4.78432 5.44618 4.88008 5.70179 4.71921 5.8215L2.11017 7.76299C1.97823 7.86118 1.79077 7.76701 1.79077 7.60254Z"
          fill="currentColor"
        />
      </>
    ),
  },
  xxxxs: {
    viewBox: '0 0 6 6',
    paths: (
      <>
        <path
          d="M1.03176 0.33313C0.646613 0.33313 0.333344 0.673406 0.333344 1.09175V3.57451C0.333344 3.99285 0.646613 4.33313 1.03176 4.33313H4.96826C5.35341 4.33313 5.66668 3.99285 5.66668 3.57451V1.09175C5.66668 0.673406 5.35341 0.33313 4.96826 0.33313H1.03176Z"
          fill="currentColor"
        />
        <path
          d="M1.52719 5.26874V4.30337C1.52719 4.1989 1.6076 4.11203 1.71177 4.10397L3.15955 3.99198C3.35948 3.97652 3.45525 4.23212 3.29438 4.35184L1.84659 5.42919C1.71465 5.52738 1.52719 5.43321 1.52719 5.26874Z"
          fill="currentColor"
        />
      </>
    ),
  },
};

export function BadgeSpeakIcon({
  variant = 'xxxs',
  ...props
}: BadgeSpeakIconProps) {
  const { viewBox, paths } = variantMap[variant];
  return (
    <SvgIcon viewBox={viewBox} {...props}>
      {paths}
    </SvgIcon>
  );
}
