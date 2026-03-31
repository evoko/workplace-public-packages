import type { SVGProps } from 'react';

export function BadgeLiveIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 6 6"
      {...props}
    >
      <circle cx="3" cy="3" r="2" fill="#e0032d" />
    </svg>
  );
}
