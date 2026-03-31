import type { SVGProps } from 'react';

export function RadioCheckedIcon(props: SVGProps<SVGSVGElement>) {
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
          stroke="#8c8c8c"
          strokeWidth="1"
          fill="none"
        />
        <circle className="radio-dot" cx="9" cy="9" r="5" fill="#2569fd" />
      </svg>
    </svg>
  );
}
