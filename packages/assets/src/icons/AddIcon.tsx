import { SvgIcon, SvgIconProps } from '@mui/material';
import { type ReactNode } from 'react';

type PathConfig = { viewBox: string; paths: ReactNode };
type IconVariant = 'md' | 'xs';

interface AddIconProps extends SvgIconProps {
  variant?: IconVariant;
}

const variantMap: Record<IconVariant, PathConfig> = {
  md: { viewBox: '0 0 24 24', paths: (
      <path fillRule="evenodd" clipRule="evenodd" d="M12 4.20001C12.4418 4.20001 12.8 4.55818 12.8 5.00001V11.2H19C19.4418 11.2 19.8 11.5582 19.8 12C19.8 12.4418 19.4418 12.8 19 12.8H12.8V19C12.8 19.4418 12.4418 19.8 12 19.8C11.5582 19.8 11.2 19.4418 11.2 19V12.8H4.99998C4.55815 12.8 4.19998 12.4418 4.19998 12C4.19998 11.5582 4.55815 11.2 4.99998 11.2H11.2V5.00001C11.2 4.55818 11.5582 4.20001 12 4.20001Z" fill="currentColor"/>) },
  xs: { viewBox: '0 0 16 16', paths: (
      <path d="M8.8 3.33336C8.8 2.89153 8.44183 2.53336 8 2.53336C7.55817 2.53336 7.2 2.89153 7.2 3.33336V7.20001H3.33333C2.8915 7.20001 2.53333 7.55818 2.53333 8.00001C2.53333 8.44184 2.8915 8.80001 3.33333 8.80001H7.2V12.6667C7.2 13.1085 7.55817 13.4667 8 13.4667C8.44183 13.4667 8.8 13.1085 8.8 12.6667V8.80001H12.6667C13.1085 8.80001 13.4667 8.44184 13.4667 8.00001C13.4667 7.55818 13.1085 7.20001 12.6667 7.20001H8.8V3.33336Z" fill="currentColor"/>) },
};

export function AddIcon({ variant = 'md', ...props }: AddIconProps) {
  const { viewBox, paths } = variantMap[variant];
  return (
    <SvgIcon viewBox={viewBox} {...props}>
      {paths}
    </SvgIcon>
  );
}
