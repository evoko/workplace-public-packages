import { cn } from '@bwp-web/styles';

type Props = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode[];
  component?: React.ElementType;
};

export function SegmentedButtonGroup({
  children,
  className,
  style,
  ...props
}: Props) {
  return (
    <div
      className={cn(className)}
      style={{
        display: 'flex',
        flexDirection: 'row',
        padding: '4px',
        borderRadius: '6px',
        gap: '8px',
        backgroundColor: 'var(--solar-surface-tertiary)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
