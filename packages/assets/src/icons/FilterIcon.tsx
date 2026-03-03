import { SvgIcon, SvgIconProps } from '@mui/material';
import { type ReactNode } from 'react';

type PathConfig = { viewBox: string; paths: ReactNode };
type IconVariant = 'md' | 'lg' | 'xs';

interface FilterIconProps extends SvgIconProps {
  variant?: IconVariant;
}

const variantMap: Record<IconVariant, PathConfig> = {
  md: { viewBox: '0 0 24 24', paths: (
      <>
        <path fillRule="evenodd" clipRule="evenodd" d="M3.2 8.00001C3.2 7.55818 3.55817 7.20001 4 7.20001H20C20.4418 7.20001 20.8 7.55818 20.8 8.00001C20.8 8.44184 20.4418 8.80001 20 8.80001H4C3.55817 8.80001 3.2 8.44184 3.2 8.00001Z" fill="currentColor"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M7.2 12C7.2 11.5582 7.55817 11.2 8 11.2H16C16.4418 11.2 16.8 11.5582 16.8 12C16.8 12.4418 16.4418 12.8 16 12.8H8C7.55817 12.8 7.2 12.4418 7.2 12Z" fill="currentColor"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M9.2 16C9.2 15.5582 9.55817 15.2 10 15.2H14C14.4418 15.2 14.8 15.5582 14.8 16C14.8 16.4418 14.4418 16.8 14 16.8H10C9.55817 16.8 9.2 16.4418 9.2 16Z" fill="currentColor"/>
      </>) },
  lg: { viewBox: '0 0 32 32', paths: (
      <>
        <path fillRule="evenodd" clipRule="evenodd" d="M4.26666 10.6666C4.26666 10.0775 4.74423 9.59998 5.33333 9.59998H26.6667C27.2558 9.59998 27.7333 10.0775 27.7333 10.6666C27.7333 11.2557 27.2558 11.7333 26.6667 11.7333H5.33333C4.74423 11.7333 4.26666 11.2557 4.26666 10.6666Z" fill="currentColor"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M9.6 16C9.6 15.4109 10.0776 14.9333 10.6667 14.9333H21.3333C21.9224 14.9333 22.4 15.4109 22.4 16C22.4 16.5891 21.9224 17.0666 21.3333 17.0666H10.6667C10.0776 17.0666 9.6 16.5891 9.6 16Z" fill="currentColor"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M12.2667 21.3333C12.2667 20.7442 12.7442 20.2666 13.3333 20.2666H18.6667C19.2558 20.2666 19.7333 20.7442 19.7333 21.3333C19.7333 21.9224 19.2558 22.4 18.6667 22.4H13.3333C12.7442 22.4 12.2667 21.9224 12.2667 21.3333Z" fill="currentColor"/>
      </>) },
  xs: { viewBox: '0 0 16 16', paths: (
      <path fillRule="evenodd" clipRule="evenodd" d="M0.199997 4.00001C0.199997 3.55818 0.558169 3.20001 0.999997 3.20001H15C15.4418 3.20001 15.8 3.55818 15.8 4.00001C15.8 4.44184 15.4418 4.80001 15 4.80001H0.999997C0.558169 4.80001 0.199997 4.44184 0.199997 4.00001ZM3.7 8.00001C3.7 7.55818 4.05817 7.20001 4.5 7.20001H11.5C11.9418 7.20001 12.3 7.55818 12.3 8.00001C12.3 8.44184 11.9418 8.80001 11.5 8.80001H4.5C4.05817 8.80001 3.7 8.44184 3.7 8.00001ZM5.7 12C5.7 11.5582 6.05817 11.2 6.5 11.2H9.5C9.94182 11.2 10.3 11.5582 10.3 12C10.3 12.4418 9.94182 12.8 9.5 12.8H6.5C6.05817 12.8 5.7 12.4418 5.7 12Z" fill="currentColor"/>) },
};

export function FilterIcon({ variant = 'md', ...props }: FilterIconProps) {
  const { viewBox, paths } = variantMap[variant];
  return (
    <SvgIcon viewBox={viewBox} {...props}>
      {paths}
    </SvgIcon>
  );
}
