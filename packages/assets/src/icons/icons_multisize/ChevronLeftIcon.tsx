import type { SVGProps } from 'react';
import { type ReactNode } from 'react';

type PathConfig = { viewBox: string; paths: ReactNode };
type IconVariant = 'md' | 'xs';

interface ChevronLeftIconProps extends SVGProps<SVGSVGElement> {
  variant?: IconVariant;
}

const variantMap: Record<IconVariant, PathConfig> = {
  md: {
    viewBox: '0 0 24 24',
    paths: (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.5657 18.5657C15.2533 18.8781 14.7467 18.8781 14.4343 18.5657L8.43431 12.5657C8.12189 12.2533 8.12189 11.7467 8.43431 11.4343L14.4343 5.43433C14.7467 5.12191 15.2533 5.12191 15.5657 5.43433C15.8781 5.74675 15.8781 6.25328 15.5657 6.5657L10.1314 12L15.5657 17.4343C15.8781 17.7467 15.8781 18.2533 15.5657 18.5657Z"
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
        d="M10.5657 3.43433C10.8781 3.74675 10.8781 4.25328 10.5657 4.5657L7.13137 8.00001L10.5657 11.4343C10.8781 11.7467 10.8781 12.2533 10.5657 12.5657C10.2533 12.8781 9.74673 12.8781 9.43431 12.5657L5.43431 8.5657C5.28428 8.41567 5.2 8.21218 5.2 8.00001C5.2 7.78784 5.28428 7.58436 5.43431 7.43433L9.43431 3.43433C9.74673 3.12191 10.2533 3.12191 10.5657 3.43433Z"
        fill="currentColor"
      />
    ),
  },
};

export function ChevronLeftIcon({
  variant = 'md',
  ...props
}: ChevronLeftIconProps) {
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
