import type { SVGProps } from 'react';

export function RadioUncheckedIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" fill="currentColor" {...props}>
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="radio-ring"
          cx="9"
          cy="9"
          r="8.5"
          stroke="currentColor"
          strokeWidth="1"
        />
      </svg>
    </svg>
  );
}
