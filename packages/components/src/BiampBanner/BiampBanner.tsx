import React from 'react';
import {
  ErrorStatusIcon,
  InfoStatusIcon,
  SuccessStatusIcon,
  WarningStatusIcon,
} from '@bwp-web/assets';
import { cn } from '@bwp-web/styles';

type Severity = 'error' | 'warning' | 'success' | 'info';

const severityStyles: Record<
  Severity,
  { background: string; color: string; border: string }
> = {
  error: {
    background: 'var(--solar-surface-danger)',
    color: 'var(--solar-text-danger)',
    border: 'var(--solar-border-danger)',
  },
  warning: {
    background: 'var(--solar-surface-warning)',
    color: 'var(--solar-text-warning)',
    border: 'var(--solar-border-warning)',
  },
  success: {
    background: 'var(--solar-surface-success)',
    color: 'var(--solar-text-success)',
    border: 'var(--solar-border-success)',
  },
  info: {
    background: 'var(--solar-surface-info)',
    color: 'var(--solar-text-info)',
    border: 'var(--solar-border-info)',
  },
};

export type BiampBannerProps = {
  show: boolean;
  children: React.ReactNode;
  severity: Severity;
};

/**
 * A full-width notification banner that slides in/out with a collapse animation.
 * Uses SOLAR design system CSS variables for severity-based colors.
 * Compose with `BiampBannerIcon`, `BiampBannerContent`, and `BiampBannerActions`.
 */
export function BiampBanner({ show, children, severity }: BiampBannerProps) {
  const colors = severityStyles[severity];

  return (
    <aside
      style={{
        overflow: 'hidden',
        transition: 'max-height 300ms ease-in-out',
        maxHeight: show ? 200 : 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          padding: '0 20px',
          minHeight: 48,
          backgroundColor: colors.background,
          color: colors.color,
          borderBottom: `0.6px solid ${colors.border}`,
        }}
      >
        {children}
      </div>
    </aside>
  );
}

const iconMapping: Record<Severity, React.ReactNode> = {
  error: (
    <ErrorStatusIcon
      style={{ width: 14, height: 14, color: 'var(--solar-text-danger)' }}
    />
  ),
  warning: (
    <WarningStatusIcon
      style={{ width: 16, height: 14, color: 'var(--solar-text-warning)' }}
    />
  ),
  success: (
    <SuccessStatusIcon
      style={{ width: 14, height: 14, color: 'var(--solar-text-success)' }}
    />
  ),
  info: (
    <InfoStatusIcon
      style={{ width: 14, height: 14, color: 'var(--solar-text-info)' }}
    />
  ),
};

export type BiampBannerIconProps = {
  severity?: Severity;
  children?: React.ReactNode;
};

/**
 * Icon slot for `BiampBanner`. Pass a `severity` to render the matching
 * default icon, or pass `children` to render a custom icon.
 */
export function BiampBannerIcon({ severity, children }: BiampBannerIconProps) {
  return <>{severity ? iconMapping[severity] : children}</>;
}

export type BiampBannerContentProps = React.HTMLAttributes<HTMLSpanElement>;

/**
 * Content slot for `BiampBanner`. Text is centered by default.
 */
export function BiampBannerContent({
  children,
  className,
  style,
  ...props
}: BiampBannerContentProps) {
  return (
    <span
      className={cn(className)}
      style={{
        textAlign: 'center',
        fontWeight: 700,
        fontSize: '0.875rem',
        lineHeight: 1.5,
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
}

export type BiampBannerActionsProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Actions slot for `BiampBanner`. Renders children in a horizontal flex row
 * with 8px gap, aligned to the trailing edge of the banner.
 */
export function BiampBannerActions({
  children,
  className,
  style,
  ...props
}: BiampBannerActionsProps) {
  return (
    <div
      className={cn(className)}
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
