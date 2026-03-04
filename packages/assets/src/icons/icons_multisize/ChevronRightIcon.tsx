import { SvgIcon, SvgIconProps } from '@mui/material';
import { type ReactNode } from 'react';

type PathConfig = { viewBox: string; paths: ReactNode };
type IconVariant = 'md' | 'xs';

interface ChevronRightIconProps extends SvgIconProps {
  variant?: IconVariant;
}

const variantMap: Record<IconVariant, PathConfig> = {
  md: {
    viewBox: '0 0 24 24',
    paths: (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.43431 5.43433C8.74673 5.12191 9.25326 5.12191 9.56568 5.43433L15.5657 11.4343C15.8781 11.7467 15.8781 12.2533 15.5657 12.5657L9.56568 18.5657C9.25326 18.8781 8.74673 18.8781 8.43431 18.5657C8.12189 18.2533 8.12189 17.7467 8.43431 17.4343L13.8686 12L8.43431 6.5657C8.12189 6.25328 8.12189 5.74675 8.43431 5.43433Z"
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
        d="M5.43431 3.43433C5.74673 3.12191 6.25326 3.12191 6.56568 3.43433L10.5657 7.43433C10.8781 7.74675 10.8781 8.25328 10.5657 8.5657L6.56568 12.5657C6.25326 12.8781 5.74673 12.8781 5.43431 12.5657C5.12189 12.2533 5.12189 11.7467 5.43431 11.4343L8.86863 8.00001L5.43431 4.5657C5.12189 4.25328 5.12189 3.74675 5.43431 3.43433Z"
        fill="currentColor"
      />
    ),
  },
};

export function ChevronRightIcon({
  variant = 'md',
  ...props
}: ChevronRightIconProps) {
  const { viewBox, paths } = variantMap[variant];
  return (
    <SvgIcon viewBox={viewBox} {...props}>
      {paths}
    </SvgIcon>
  );
}
