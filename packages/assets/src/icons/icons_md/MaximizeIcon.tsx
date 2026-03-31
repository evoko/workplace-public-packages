import type { SVGProps } from 'react';

export function MaximizeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        d="M16 20H20M20 20V16M20 20L14 14M8 4H4M4 4V8M4 4L10 10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
