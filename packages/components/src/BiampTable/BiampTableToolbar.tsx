import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@bwp-web/styles';

export type BiampTableToolbarProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function BiampTableToolbar({
  children,
  className,
  style,
  ...props
}: BiampTableToolbarProps) {
  return (
    <div
      role="toolbar"
      className={cn(className)}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '8px',
        minHeight: 44,
        paddingLeft: '24px',
        paddingRight: '24px',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
