import { SvgIcon, SvgIconProps } from '@mui/material';
import { type ReactNode } from 'react';

type PathConfig = { viewBox: string; paths: ReactNode };
type IconVariant = 'md' | 'xs';

interface ChevronUpIconProps extends SvgIconProps {
  variant?: IconVariant;
}

const variantMap: Record<IconVariant, PathConfig> = {
  md: { viewBox: '0 0 24 24', paths: (
      <path fillRule="evenodd" clipRule="evenodd" d="M5.43431 15.5657C5.12189 15.2533 5.12189 14.7467 5.43431 14.4343L11.4343 8.43433C11.7467 8.12191 12.2533 8.12191 12.5657 8.43433L18.5657 14.4343C18.8781 14.7467 18.8781 15.2533 18.5657 15.5657C18.2533 15.8781 17.7467 15.8781 17.4343 15.5657L12 10.1314L6.56568 15.5657C6.25326 15.8781 5.74673 15.8781 5.43431 15.5657Z" fill="currentColor"/>) },
  xs: { viewBox: '0 0 16 16', paths: (
      <path fillRule="evenodd" clipRule="evenodd" d="M8 5.20001C8.21217 5.20001 8.41566 5.2843 8.56569 5.43433L12.5657 9.43433C12.8781 9.74675 12.8781 10.2533 12.5657 10.5657C12.2533 10.8781 11.7467 10.8781 11.4343 10.5657L8 7.13138L4.56569 10.5657C4.25327 10.8781 3.74673 10.8781 3.43432 10.5657C3.1219 10.2533 3.1219 9.74675 3.43432 9.43433L7.43432 5.43433C7.58434 5.2843 7.78783 5.20001 8 5.20001Z" fill="currentColor"/>) },
};

export function ChevronUpIcon({ variant = 'md', ...props }: ChevronUpIconProps) {
  const { viewBox, paths } = variantMap[variant];
  return (
    <SvgIcon viewBox={viewBox} {...props}>
      {paths}
    </SvgIcon>
  );
}
