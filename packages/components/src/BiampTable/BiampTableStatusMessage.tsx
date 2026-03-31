import {
  cloneElement,
  type HTMLAttributes,
  type JSX,
  type ReactNode,
} from 'react';
import { cn } from '@bwp-web/styles';

export type BiampTableStatusMessageProps = HTMLAttributes<HTMLDivElement> & {
  /** Required icon element rendered at 56x56. */
  icon: JSX.Element;
  /** Required title text. */
  title: string;
  /** Optional description text. */
  description?: string;
  /** Optional extra content (e.g. retry buttons). */
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function BiampTableStatusMessage({
  icon,
  title,
  description,
  children,
  className,
  style,
  ...divProps
}: BiampTableStatusMessageProps) {
  return (
    <div
      className={cn(className)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        ...style,
      }}
      {...divProps}
    >
      {cloneElement(icon, {
        'aria-hidden': true,
        style: { width: 56, height: 56, ...icon.props.style },
      })}
      <h2
        style={{
          margin: 0,
          fontSize: 'var(--solar-font-size-h2, 1.25rem)',
          fontWeight: 'var(--solar-font-weight-h2, 600)',
          color: 'var(--solar-text-default)',
        }}
      >
        {title}
      </h2>
      {description && (
        <p
          style={{
            margin: 0,
            fontSize: 'var(--solar-font-size-body1, 1rem)',
            color: 'var(--solar-text-default)',
          }}
        >
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
