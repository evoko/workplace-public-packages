import type { SVGProps } from 'react';
import { type ReactNode } from 'react';

type PathConfig = { viewBox: string; paths: ReactNode };
type IconVariant = 'md' | 'xs';

interface ChevronDownIconProps extends SVGProps<SVGSVGElement> {
  variant?: IconVariant;
}

const variantMap: Record<IconVariant, PathConfig> = {
  md: {
    viewBox: '0 0 24 24',
    paths: (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.5657 8.43433C18.8781 8.74675 18.8781 9.25328 18.5657 9.5657L12.5657 15.5657C12.2533 15.8781 11.7467 15.8781 11.4343 15.5657L5.43431 9.5657C5.12189 9.25328 5.12189 8.74675 5.43431 8.43433C5.74673 8.12191 6.25327 8.12191 6.56568 8.43433L12 13.8686L17.4343 8.43433C17.7467 8.12191 18.2533 8.12191 18.5657 8.43433Z"
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
        d="M3.43431 5.43433C3.74673 5.12191 4.25326 5.12191 4.56568 5.43433L8 8.86864L11.4343 5.43433C11.7467 5.12191 12.2533 5.12191 12.5657 5.43433C12.8781 5.74675 12.8781 6.25328 12.5657 6.5657L8.56568 10.5657C8.41565 10.7157 8.21217 10.8 8 10.8C7.78782 10.8 7.58434 10.7157 7.43431 10.5657L3.43431 6.5657C3.12189 6.25328 3.12189 5.74675 3.43431 5.43433Z"
        fill="currentColor"
      />
    ),
  },
};

export function ChevronDownIcon({
  variant = 'md',
  ...props
}: ChevronDownIconProps) {
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
