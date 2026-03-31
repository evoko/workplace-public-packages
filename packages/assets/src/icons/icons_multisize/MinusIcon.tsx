import type { SVGProps } from 'react';
import { type ReactNode } from 'react';

type PathConfig = { viewBox: string; paths: ReactNode };
type IconVariant = 'md' | 'xs';

interface MinusIconProps extends SVGProps<SVGSVGElement> {
  variant?: IconVariant;
}

const variantMap: Record<IconVariant, PathConfig> = {
  md: {
    viewBox: '0 0 24 24',
    paths: (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.8 12C19.8 12.4418 19.4418 12.8 19 12.8L4.99998 12.8C4.55815 12.8 4.19998 12.4418 4.19998 12C4.19998 11.5582 4.55815 11.2 4.99998 11.2L19 11.2C19.4418 11.2 19.8 11.5582 19.8 12Z"
        fill="currentColor"
      />
    ),
  },
  xs: {
    viewBox: '0 0 16 16',
    paths: (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.4667 8.00001C13.4667 8.44184 13.1085 8.80001 12.6667 8.80001L3.33333 8.80001C2.8915 8.80001 2.53333 8.44184 2.53333 8.00001C2.53333 7.55818 2.8915 7.20001 3.33333 7.20001L12.6667 7.20001C13.1085 7.20001 13.4667 7.55819 13.4667 8.00001Z"
        fill="currentColor"
      />
    ),
  },
};

export function MinusIcon({ variant = 'md', ...props }: MinusIconProps) {
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
