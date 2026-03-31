import type React from 'react';

export type BiampTableCellActionButtonProps = {
  /** Tooltip label for the action button. */
  label: string;
  /** Icon to display inside the button. */
  icon: React.ReactNode;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
} & Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'aria-label'
>;

/** Icon button with a tooltip, designed for use inside table cell action columns. */
export function BiampTableCellActionButton({
  label,
  icon,
  ...props
}: BiampTableCellActionButtonProps) {
  return (
    <span title={label}>
      <button
        type="button"
        aria-label={label}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
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
        {icon}
      </button>
    </span>
  );
}
