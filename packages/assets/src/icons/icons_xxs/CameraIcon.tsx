import type { SVGProps } from 'react';

export function CameraIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 12 12"
      {...props}
    >
      <path
        d="M8.4 8.55C8.4 9.627 7.527 10.5 6.45 10.5H1.95C0.873 10.5 0 9.627 0 8.55V3.45C0 2.373 0.873 1.5 1.95 1.5H6.45C7.527 1.5 8.4 2.373 8.4 3.45V8.55ZM11.7717 2.7585C11.6307 2.6787 11.4576 2.6808 11.3184 2.7642L9 4.1553V7.8447L11.3187 9.2358C11.3898 9.2787 11.4696 9.3 11.55 9.3C11.6265 9.3 11.703 9.2805 11.7717 9.2415C11.9127 9.1617 12 9.0123 12 8.85V3.15C12 2.9877 11.9127 2.8383 11.7717 2.7585Z"
        fill="currentColor"
      />
    </svg>
  );
}
