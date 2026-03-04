import { Stack, Typography } from '@mui/material';
import { cloneElement, type JSX, type ReactNode } from 'react';

export type BiampTableStatusMessageProps = {
  /** Required icon element. */
  icon: JSX.Element;
  /** Required title text. */
  title: string;
  /** Optional description text. */
  description?: string;
  /** Optional extra content (e.g. retry buttons). */
  children?: ReactNode;
};

export function BiampTableStatusMessage({
  icon,
  title,
  description,
  children,
}: BiampTableStatusMessageProps) {
  return (
    <Stack alignItems="center" gap={2}>
      {cloneElement(icon, { sx: { width: 56, height: 56, ...icon.props.sx } })}
      <Typography variant="h2">{title}</Typography>
      {description && <Typography variant="body1">{description}</Typography>}
      {children}
    </Stack>
  );
}
