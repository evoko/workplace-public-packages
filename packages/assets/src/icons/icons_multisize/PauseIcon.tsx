import type { SVGProps } from 'react';
import { type ReactNode } from 'react';

type PathConfig = { viewBox: string; paths: ReactNode };
type IconVariant = 'md' | 'xs';

interface PauseIconProps extends SVGProps<SVGSVGElement> {
  variant?: IconVariant;
}

const variantMap: Record<IconVariant, PathConfig> = {
  md: {
    viewBox: '0 0 24 24',
    paths: (
      <>
        <path
          d="M6 18.4V5.6C6 5.26863 6.26863 5 6.6 5H9.4C9.73137 5 10 5.26863 10 5.6V18.4C10 18.7314 9.73137 19 9.4 19H6.6C6.26863 19 6 18.7314 6 18.4Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M14 18.4V5.6C14 5.26863 14.2686 5 14.6 5H17.4C17.7314 5 18 5.26863 18 5.6V18.4C18 18.7314 17.7314 19 17.4 19H14.6C14.2686 19 14 18.7314 14 18.4Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </>
    ),
  },
  xs: {
    viewBox: '0 0 16 16',
    paths: (
      <>
        <path
          d="M3 12.5714V3.42857C3 3.19188 3.26863 3 3.6 3H6.4C6.73137 3 7 3.19188 7 3.42857V12.5714C7 12.8081 6.73137 13 6.4 13H3.6C3.26863 13 3 12.8081 3 12.5714Z"
          fill="currentColor"
        />
        <path
          d="M9 12.5714V3.42857C9 3.19188 9.2686 3 9.6 3H12.4C12.7314 3 13 3.19188 13 3.42857V12.5714C13 12.8081 12.7314 13 12.4 13H9.6C9.2686 13 9 12.8081 9 12.5714Z"
          fill="currentColor"
        />
      </>
    ),
  },
};

export function PauseIcon({ variant = 'md', ...props }: PauseIconProps) {
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
