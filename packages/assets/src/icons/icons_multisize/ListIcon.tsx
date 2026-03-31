import type { SVGProps } from 'react';
import { type ReactNode } from 'react';

type PathConfig = { viewBox: string; paths: ReactNode };
type IconVariant = 'md' | 'xs';

interface ListIconProps extends SVGProps<SVGSVGElement> {
  variant?: IconVariant;
}

const variantMap: Record<IconVariant, PathConfig> = {
  md: {
    viewBox: '0 0 24 24',
    paths: (
      <>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.20001 6.00001C8.20001 5.55818 8.55818 5.20001 9.00001 5.20001H20C20.4418 5.20001 20.8 5.55818 20.8 6.00001C20.8 6.44184 20.4418 6.80001 20 6.80001H9.00001C8.55818 6.80001 8.20001 6.44184 8.20001 6.00001Z"
          fill="currentColor"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.20001 12C8.20001 11.5582 8.55818 11.2 9.00001 11.2H20C20.4418 11.2 20.8 11.5582 20.8 12C20.8 12.4418 20.4418 12.8 20 12.8H9.00001C8.55818 12.8 8.20001 12.4418 8.20001 12Z"
          fill="currentColor"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.20001 18C8.20001 17.5582 8.55818 17.2 9.00001 17.2H20C20.4418 17.2 20.8 17.5582 20.8 18C20.8 18.4418 20.4418 18.8 20 18.8H9.00001C8.55818 18.8 8.20001 18.4418 8.20001 18Z"
          fill="currentColor"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.00001 5.20001C5.44184 5.20001 5.80001 5.55818 5.80001 6.00001V6.01001C5.80001 6.45184 5.44184 6.81001 5.00001 6.81001C4.55818 6.81001 4.20001 6.45184 4.20001 6.01001V6.00001C4.20001 5.55818 4.55818 5.20001 5.00001 5.20001Z"
          fill="currentColor"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.00001 11.2C5.44184 11.2 5.80001 11.5582 5.80001 12V12.01C5.80001 12.4518 5.44184 12.81 5.00001 12.81C4.55818 12.81 4.20001 12.4518 4.20001 12.01V12C4.20001 11.5582 4.55818 11.2 5.00001 11.2Z"
          fill="currentColor"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.00001 17.2C5.44184 17.2 5.80001 17.5582 5.80001 18V18.01C5.80001 18.4518 5.44184 18.81 5.00001 18.81C4.55818 18.81 4.20001 18.4518 4.20001 18.01V18C4.20001 17.5582 4.55818 17.2 5.00001 17.2Z"
          fill="currentColor"
        />
      </>
    ),
  },
  xs: {
    viewBox: '0 0 16 16',
    paths: (
      <>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3.86667 4.00001C3.86667 3.55818 4.22484 3.20001 4.66667 3.20001H13.6667C14.1085 3.20001 14.4667 3.55818 14.4667 4.00001C14.4667 4.44184 14.1085 4.80001 13.6667 4.80001H4.66667C4.22484 4.80001 3.86667 4.44184 3.86667 4.00001Z"
          fill="currentColor"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3.86667 8.00001C3.86667 7.55818 4.22484 7.20001 4.66667 7.20001H13.6667C14.1085 7.20001 14.4667 7.55818 14.4667 8.00001C14.4667 8.44184 14.1085 8.80001 13.6667 8.80001H4.66667C4.22484 8.80001 3.86667 8.44184 3.86667 8.00001Z"
          fill="currentColor"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3.86667 12C3.86667 11.5582 4.22484 11.2 4.66667 11.2H13.6667C14.1085 11.2 14.4667 11.5582 14.4667 12C14.4667 12.4418 14.1085 12.8 13.6667 12.8H4.66667C4.22484 12.8 3.86667 12.4418 3.86667 12Z"
          fill="currentColor"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2.00001 3.20001C2.44184 3.20001 2.80001 3.55818 2.80001 4.00001V4.00668C2.80001 4.44851 2.44184 4.80668 2.00001 4.80668C1.55818 4.80668 1.20001 4.44851 1.20001 4.00668V4.00001C1.20001 3.55818 1.55818 3.20001 2.00001 3.20001Z"
          fill="currentColor"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2.00001 7.20001C2.44184 7.20001 2.80001 7.55818 2.80001 8.00001V8.00668C2.80001 8.44851 2.44184 8.80668 2.00001 8.80668C1.55818 8.80668 1.20001 8.44851 1.20001 8.00668V8.00001C1.20001 7.55818 1.55818 7.20001 2.00001 7.20001Z"
          fill="currentColor"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2.00001 11.2C2.44184 11.2 2.80001 11.5582 2.80001 12V12.0067C2.80001 12.4485 2.44184 12.8067 2.00001 12.8067C1.55818 12.8067 1.20001 12.4485 1.20001 12.0067V12C1.20001 11.5582 1.55818 11.2 2.00001 11.2Z"
          fill="currentColor"
        />
      </>
    ),
  },
};

export function ListIcon({ variant = 'md', ...props }: ListIconProps) {
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
