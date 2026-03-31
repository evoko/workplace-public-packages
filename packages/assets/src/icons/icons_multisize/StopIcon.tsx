import type { SVGProps } from 'react';
import { type ReactNode } from 'react';

type PathConfig = { viewBox: string; paths: ReactNode };
type IconVariant = 'md' | 'xs';

interface StopIconProps extends SVGProps<SVGSVGElement> {
  variant?: IconVariant;
}

const variantMap: Record<IconVariant, PathConfig> = {
  md: {
    viewBox: '0 0 24 24',
    paths: (
      <rect x="2" y="2" width="20" height="20" rx="2" fill="currentColor" />
    ),
  },
  xs: {
    viewBox: '0 0 16 16',
    paths: (
      <rect x="3" y="3" width="10" height="10" rx="1" fill="currentColor" />
    ),
  },
};

export function StopIcon({ variant = 'md', ...props }: StopIconProps) {
  const { viewBox, paths } = variantMap[variant];
  return (
    <svg
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox={viewBox}
      {...props}
    >
      {paths}
    </svg>
  );
}
