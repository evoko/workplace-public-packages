import { SvgIcon, SvgIconProps } from '@mui/material';
import { type ReactNode } from 'react';

type PathConfig = { viewBox: string; paths: ReactNode };
type IconVariant = 'md' | 'xs';

interface ExternalLinkIconProps extends SvgIconProps {
  variant?: IconVariant;
}

const sharedPaths = (
  <>
    <path
      d="M6.66667 4V5.33333H3.33333V12.6667H10.6667V9.33333H12V13.3333C12 13.7015 11.7015 14 11.3333 14H2.66667C2.29848 14 2 13.7015 2 13.3333V4.66667C2 4.29848 2.29848 4 2.66667 4H6.66667ZM14 2V7.33333H12.6667L12.6666 4.27533L7.4714 9.4714L6.52859 8.5286L11.7233 3.33333H8.66667V2H14Z"
      fill="currentColor"
    />
  </>
);

const variantMap: Record<IconVariant, PathConfig> = {
  md: {
    viewBox: '0 0 16 16',
    paths: sharedPaths,
  },
  xs: {
    viewBox: '0 0 16 16',
    paths: sharedPaths,
  },
};

export function ExternalLinkIcon({
  variant = 'md',
  ...props
}: ExternalLinkIconProps) {
  const { viewBox, paths } = variantMap[variant];
  return (
    <SvgIcon viewBox={viewBox} {...props}>
      {paths}
    </SvgIcon>
  );
}
