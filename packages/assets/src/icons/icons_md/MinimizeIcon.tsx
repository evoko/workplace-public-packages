import type { SVGProps } from 'react';

export function MinimizeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        d="M6 10H10M10 10V6M10 10L4 4M18 14H14M14 14V18M14 14L20 20"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
