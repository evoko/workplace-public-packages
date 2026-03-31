import { BiampLogoIcon } from '@bwp-web/assets';
import { cn } from '@bwp-web/styles';
import { JSX } from 'react';

type BiampSidebarProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  bottomLogoIcon?: JSX.Element;
};

export function BiampSidebar({
  children,
  bottomLogoIcon,
  className,
  style,
  ...props
}: BiampSidebarProps) {
  return (
    <div
      className={cn('flex flex-col', className)}
      style={{ width: '48px', height: '100%', ...style }}
      {...props}
    >
      <div className="flex flex-col" style={{ height: '100%' }}>
        {children}
      </div>
      {bottomLogoIcon ?? (
        <BiampLogoIcon style={{ width: '48px', height: '15px' }} />
      )}
    </div>
  );
}

type BiampSidebarIconList = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

export function BiampSidebarIconList({
  children,
  className,
  style,
  ...props
}: BiampSidebarIconList) {
  return (
    <div
      className={cn('flex flex-col', className)}
      style={{ height: '100%', gap: '4px', ...style }}
      {...props}
    >
      {children}
    </div>
  );
}

type BiampSidebarIconProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
  icon: JSX.Element;
  selectedIcon?: JSX.Element;
};

export function BiampSidebarIcon({
  selected,
  icon,
  selectedIcon,
  className,
  style,
  ...props
}: BiampSidebarIconProps) {
  const displayedSelectedIcon = selectedIcon ?? icon;
  return (
    <button
      className={cn(
        'flex items-center justify-center rounded-lg',
        selected && 'bg-[var(--solar-surface-default)]',
        className,
      )}
      style={{
        minWidth: '48px',
        maxWidth: '48px',
        minHeight: '48px',
        maxHeight: '48px',
        border: 'none',
        background: selected ? undefined : 'transparent',
        cursor: 'pointer',
        padding: 0,
        ...style,
      }}
      {...props}
    >
      {selected ? displayedSelectedIcon : icon}
    </button>
  );
}

type BiampSidebarComponentProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

export function BiampSidebarComponent({
  children,
  className,
  style,
  ...props
}: BiampSidebarComponentProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center overflow-hidden rounded-lg',
        className,
      )}
      style={{
        minWidth: '48px',
        maxWidth: '48px',
        minHeight: '48px',
        maxHeight: '48px',
        border: '0.6px solid var(--solar-border-default)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
