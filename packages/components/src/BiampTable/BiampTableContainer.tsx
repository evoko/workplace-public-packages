import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@bwp-web/styles';

export type BiampTableContainerProps = {
  /** Show a top border. @default true */
  withBorderTop?: boolean;
  /** Show a bottom border. @default false */
  withBorderBottom?: boolean;
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'style'>;

export function BiampTableContainer({
  withBorderTop = true,
  withBorderBottom = false,
  children,
  className,
  style,
  ...props
}: BiampTableContainerProps) {
  return (
    <div
      className={cn(className)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        padding: '0 24px',
        gap: '0px',
        borderTop: withBorderTop
          ? '0.6px solid var(--solar-border-default)'
          : undefined,
        borderBottom: withBorderBottom
          ? '0.6px solid var(--solar-border-default)'
          : undefined,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
