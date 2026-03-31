import type { SVGProps } from 'react';

export function CeilingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 16 16"
      {...props}
    >
      <rect
        x="2.8"
        y="2.8"
        width="10.4"
        height="10.4"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="8" cy="8" r="2" fill="currentColor" />
    </svg>
  );
}
