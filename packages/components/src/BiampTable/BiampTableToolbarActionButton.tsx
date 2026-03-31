import type React from 'react';

export type BiampTableToolbarActionButtonProps = {
  /** Accessible label for the icon button. */
  label: string;
  /** Icon to display inside the button. */
  icon: React.ReactNode;
  /** Optional badge content. Shown as a dot indicator when provided. */
  badgeContent?: number | string | null;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
} & Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'aria-label'
>;

export function BiampTableToolbarActionButton({
  label,
  icon,
  badgeContent,
  ...props
}: BiampTableToolbarActionButtonProps) {
  const showBadge = badgeContent != null && badgeContent !== 0;

  return (
    <button
      type="button"
      aria-label={showBadge ? `${label} (${badgeContent})` : label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        background: 'none',
        border: 'none',
        borderRadius: '50%',
        cursor: props.disabled ? 'default' : 'pointer',
        padding: '8px',
        color: 'inherit',
        opacity: props.disabled ? 0.5 : 1,
      }}
      {...props}
    >
      {showBadge ? (
        <span style={{ position: 'relative', display: 'inline-flex' }}>
          {icon}
          <span
            style={{
              position: 'absolute',
              top: 0,
              right: -3,
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: 'var(--solar-status-info, #2196f3)',
            }}
          />
        </span>
      ) : (
        icon
      )}
    </button>
  );
}
