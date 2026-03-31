import { cn } from '@bwp-web/styles';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  active?: boolean;
  small?: boolean;
  component?: React.ElementType;
};

export function SegmentedButton({
  children,
  active,
  small,
  className,
  style,
  ...props
}: Props) {
  return (
    <button
      className={cn(className)}
      style={{
        backgroundColor: active
          ? 'var(--solar-surface-default)'
          : 'transparent',
        color: active
          ? 'var(--solar-text-default)'
          : 'var(--solar-text-secondary)',
        borderRadius: '4px',
        border: active ? '1px solid var(--solar-border-default)' : 'none',
        lineHeight: 1.5,
        paddingLeft: '12px',
        paddingRight: '12px',
        paddingTop: 0,
        paddingBottom: 0,
        height: small ? '22px' : '26px',
        fontSize: small ? '12px' : 'inherit',
        letterSpacing: small ? '-0.24px' : undefined,
        boxShadow: active ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        textTransform: 'none',
        fontFamily: 'inherit',
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
