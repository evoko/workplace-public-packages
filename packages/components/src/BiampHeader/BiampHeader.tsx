import React, { JSX, useRef, useEffect } from 'react';
import { BiampRedLogo, SearchIcon } from '@bwp-web/assets';
import { cn } from '@bwp-web/styles';

type BiampHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode;
};

export function BiampHeader({
  children,
  className,
  style,
  ...props
}: BiampHeaderProps) {
  return (
    <div
      className={cn(className)}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: '12px 20px',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

type BiampHeaderTitleProps = React.HTMLAttributes<HTMLDivElement> & {
  icon?: JSX.Element;
  title?: string;
  subtitle?: string;
};

export function BiampHeaderTitle({
  icon,
  title,
  subtitle,
  className,
  style,
  ...props
}: BiampHeaderTitleProps) {
  return (
    <div
      className={cn(className)}
      style={{
        paddingRight: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        ...style,
      }}
      {...props}
    >
      {icon ? (
        <div
          style={{
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
      ) : (
        <img src={BiampRedLogo} alt="Biamp" style={{ width: 24, height: 24 }} />
      )}
      <div style={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
        {title && (
          <h4
            style={{
              margin: 0,
              fontSize: 'var(--solar-font-size-h4, 1.25rem)',
              fontWeight: 'var(--solar-font-weight-h4, 600)',
              lineHeight: 'var(--solar-line-height-h4, 1.4)',
            }}
          >
            {title}
          </h4>
        )}
        {subtitle && (
          <h4
            style={{
              margin: 0,
              fontSize: 'var(--solar-font-size-h4, 1.25rem)',
              fontWeight: 'var(--solar-font-weight-h4, 600)',
              lineHeight: 'var(--solar-line-height-h4, 1.4)',
              color: 'var(--solar-text-secondary)',
            }}
          >
            {subtitle}
          </h4>
        )}
      </div>
    </div>
  );
}

type BiampHeaderSearchProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

export function BiampHeaderSearch({
  className,
  style,
  placeholder = 'Search...',
  ...props
}: BiampHeaderSearchProps) {
  return (
    <div
      className={cn(className)}
      style={{
        padding: '0 12px',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          height: 40,
          gap: 8,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            color: 'var(--solar-text-secondary)',
          }}
        >
          <SearchIcon />
        </div>
        <input
          placeholder={placeholder}
          style={{
            flex: 1,
            height: 40,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            font: 'inherit',
            color: 'var(--solar-text-default)',
            ...style,
          }}
          {...props}
        />
      </div>
    </div>
  );
}

type BiampHeaderActionsProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

export function BiampHeaderActions({
  children,
  className,
  style,
  ...props
}: BiampHeaderActionsProps) {
  return (
    <div
      className={cn(className)}
      style={{
        paddingLeft: 24,
        gap: 16,
        display: 'flex',
        alignItems: 'center',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

type BiampHeaderButtonListProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

export function BiampHeaderButtonList({
  children,
  className,
  style,
  ...props
}: BiampHeaderButtonListProps) {
  return (
    <div
      className={cn(className)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

type BiampHeaderButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: JSX.Element;
  selectedIcon?: JSX.Element;
  selected?: boolean;
};

export function BiampHeaderButton({
  icon,
  selectedIcon,
  selected,
  className,
  style,
  ...props
}: BiampHeaderButtonProps) {
  const displayedSelectedIcon = selectedIcon ?? icon;
  return (
    <button
      className={cn(className)}
      style={{
        minWidth: 40,
        maxWidth: 40,
        minHeight: 40,
        maxHeight: 40,
        borderRadius: 4,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        background: selected
          ? 'var(--solar-surface-selected, rgba(0,0,0,0.08))'
          : 'transparent',
        color: 'inherit',
        ...style,
      }}
      {...props}
    >
      {selected ? displayedSelectedIcon : icon}
    </button>
  );
}

type BiampAppPopoverProps = React.HTMLAttributes<HTMLDivElement> & {
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose?: () => void;
  children: React.ReactNode;
};

export function BiampAppPopover({
  children,
  open,
  anchorEl,
  onClose,
  className,
  style,
  ...props
}: BiampAppPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !onClose) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        anchorEl &&
        !anchorEl.contains(event.target as Node)
      ) {
        onClose?.();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose, anchorEl]);

  if (!open) return null;

  const anchorRect = anchorEl?.getBoundingClientRect();

  return (
    <div
      ref={popoverRef}
      className={cn(className)}
      style={{
        position: 'fixed',
        top: anchorRect ? anchorRect.bottom + 4 : undefined,
        left: anchorRect ? anchorRect.left - 150 + anchorRect.width : undefined,
        zIndex: 1300,
        borderRadius: 16,
        border: '0.6px solid var(--solar-border-default)',
        boxShadow: '0px 4px 24px 0px rgba(0, 0, 0, 0.15)',
        background: 'var(--solar-surface-default)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

type BiampAppDialogProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

export function BiampAppDialog({
  children,
  className,
  style,
  ...props
}: BiampAppDialogProps) {
  return (
    <div
      className={cn(className)}
      style={{
        padding: 16,
        display: 'inline-flex',
        flexWrap: 'wrap',
        gap: 12,
        maxWidth: 284,
        borderRadius: 16,
        backgroundColor: 'var(--solar-surface-default)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

type BiampAppDialogItemProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  name: string;
};

export function BiampAppDialogItem({
  children,
  name,
  className,
  style,
  ...props
}: BiampAppDialogItemProps) {
  return (
    <div
      className={cn('biamp-app-dialog-item', className)}
      style={{
        width: 76,
        height: 89,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        justifyContent: 'center',
        gap: 4,
        borderRadius: 12,
        border: '0.6px solid transparent',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
        ...style,
      }}
      {...props}
    >
      <div
        style={{
          marginTop: 8,
          width: 54,
          height: 54,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
      <span
        style={{
          fontSize: 'var(--solar-font-size-caption, 0.75rem)',
          fontWeight: 600,
          textAlign: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '100%',
        }}
      >
        {name}
      </span>
    </div>
  );
}

type BiampHeaderProfileProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  image: string;
  selected?: boolean;
};

export function BiampHeaderProfile({
  image,
  selected,
  className,
  style,
  ...props
}: BiampHeaderProfileProps) {
  return (
    <button
      className={cn(className)}
      style={{
        minWidth: 36,
        maxWidth: 36,
        minHeight: 36,
        maxHeight: 36,
        borderRadius: 6,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        background: selected
          ? 'var(--solar-surface-selected, rgba(0,0,0,0.08))'
          : 'transparent',
        color: 'inherit',
        ...style,
      }}
      {...props}
    >
      <img
        src={image}
        alt="Profile Image"
        style={{
          width: 32,
          height: 32,
          borderRadius: 4,
          border:
            '0.6px solid var(--solar-border-default, rgba(0, 0, 0, 0.15))',
        }}
      />
    </button>
  );
}
