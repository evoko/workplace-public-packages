import { SvgIcon, SvgIconProps } from '@mui/material';
import { type ReactNode } from 'react';

type PathConfig = { viewBox: string; paths: ReactNode };
type IconVariant = 'md' | 'xs';

interface ColumnsIconProps extends SvgIconProps {
  variant?: IconVariant;
}

const variantMap: Record<IconVariant, PathConfig> = {
  md: { viewBox: '0 0 24 24', paths: (
      <>
        <path fillRule="evenodd" clipRule="evenodd" d="M18 4.20001C18.4418 4.20001 18.8 4.55818 18.8 5.00001L18.8 19C18.8 19.4418 18.4418 19.8 18 19.8C17.5582 19.8 17.2 19.4418 17.2 19L17.2 5.00001C17.2 4.55818 17.5582 4.20001 18 4.20001Z" fill="currentColor"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M12 4.20001C12.4418 4.20001 12.8 4.55818 12.8 5.00001L12.8 19C12.8 19.4418 12.4418 19.8 12 19.8C11.5582 19.8 11.2 19.4418 11.2 19L11.2 5.00001C11.2 4.55818 11.5582 4.20001 12 4.20001Z" fill="currentColor"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M6.00001 4.20001C6.44184 4.20001 6.80001 4.55818 6.80001 5.00001L6.80001 19C6.80001 19.4418 6.44184 19.8 6.00001 19.8C5.55819 19.8 5.20001 19.4418 5.20001 19L5.20001 5.00001C5.20001 4.55818 5.55818 4.20001 6.00001 4.20001Z" fill="currentColor"/>
      </>) },
  xs: { viewBox: '0 0 16 16', paths: (
      <path fillRule="evenodd" clipRule="evenodd" d="M4.00001 2.53333C4.44184 2.53333 4.80001 2.8915 4.80001 3.33333L4.80001 12.6667C4.80001 13.1085 4.44184 13.4667 4.00001 13.4667C3.55819 13.4667 3.20001 13.1085 3.20001 12.6667L3.20001 3.33333C3.20001 2.8915 3.55818 2.53333 4.00001 2.53333ZM8.00001 2.53333C8.44184 2.53333 8.80001 2.8915 8.80001 3.33333L8.80001 12.6667C8.80001 13.1085 8.44184 13.4667 8.00001 13.4667C7.55818 13.4667 7.20001 13.1085 7.20001 12.6667L7.20001 3.33333C7.20001 2.8915 7.55818 2.53333 8.00001 2.53333ZM12 2.53333C12.4418 2.53333 12.8 2.8915 12.8 3.33333L12.8 12.6667C12.8 13.1085 12.4418 13.4667 12 13.4667C11.5582 13.4667 11.2 13.1085 11.2 12.6667L11.2 3.33333C11.2 2.8915 11.5582 2.53333 12 2.53333Z" fill="currentColor"/>) },
};

export function ColumnsIcon({ variant = 'md', ...props }: ColumnsIconProps) {
  const { viewBox, paths } = variantMap[variant];
  return (
    <SvgIcon viewBox={viewBox} {...props}>
      {paths}
    </SvgIcon>
  );
}
