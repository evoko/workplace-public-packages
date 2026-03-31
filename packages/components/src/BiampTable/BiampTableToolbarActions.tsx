import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@bwp-web/styles';

export type BiampTableToolbarActionsProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function BiampTableToolbarActions({
  children,
  className,
  style,
  ...props
}: BiampTableToolbarActionsProps) {
  return (
    <div
      className={cn(className)}
      style={{
        display: 'flex',
        alignItems: 'center',
        marginLeft: 'auto',
        gap: '8px',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
