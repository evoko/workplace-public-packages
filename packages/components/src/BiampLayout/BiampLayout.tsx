import React from 'react';
import { cn } from '@bwp-web/styles';

type BiampLayoutProps = React.HTMLAttributes<HTMLDivElement> & {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
};

export function BiampLayout({
  header,
  sidebar,
  children,
  className,
  style,
  ...props
}: BiampLayoutProps) {
  return (
    <div
      className={cn('flex flex-col h-screen', className)}
      style={{
        backgroundColor: 'var(--solar-surface-tertiary)',
        ...style,
      }}
      {...props}
    >
      {header}
      <div
        className={cn(
          'flex flex-row flex-1 min-h-0',
          'gap-3 px-3 pb-3 md:gap-5 md:px-5 md:pb-5',
          header ? 'pt-0' : 'pt-3 md:pt-5',
        )}
      >
        {sidebar}
        {children}
      </div>
    </div>
  );
}
