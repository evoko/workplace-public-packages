import React from 'react';
import { cn } from '@bwp-web/styles';

export type BiampWrapperProps = React.HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode;
};

/**
 * A full-page content wrapper that stretches to fill all available space
 * with 16px padding, 8px border radius, and scrollable overflow.
 * Background: white (light) / `grey.800` (dark).
 */
export function BiampWrapper({
  children,
  className,
  style,
  ...props
}: BiampWrapperProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-start flex-1 h-full w-full rounded-lg overflow-auto p-4',
        className,
      )}
      style={{
        overscrollBehavior: 'none',
        backgroundColor: 'var(--solar-surface-overlay)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
