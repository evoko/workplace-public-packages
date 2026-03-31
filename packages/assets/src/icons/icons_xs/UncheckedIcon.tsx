import type { SVGProps } from 'react';

export function UncheckedIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" fill="currentColor" {...props}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="0.5"
          y="0.5"
          width="15"
          height="15"
          rx="3.5"
          stroke="currentColor"
          strokeOpacity="0.4"
        />
      </svg>
    </svg>
  );
}
