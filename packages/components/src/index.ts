// Stub icon components used by @workplace/styles theme.
// These will be replaced with real implementations when the components package is built out.

import type { FC } from 'react';

interface IconProps {
  sx?: Record<string, unknown>;
  [key: string]: unknown;
}

type IconComponent = FC<IconProps>;

export const BreadcrumbIcon: IconComponent = () => null;
export const CheckedIcon: IconComponent = () => null;
export const DatePickerIcon: IconComponent = () => null;
export const ErrorStatusIcon: IconComponent = () => null;
export const IndeterminateIcon: IconComponent = () => null;
export const InfoStatusIcon: IconComponent = () => null;
export const InputCloseIcon: IconComponent = () => null;
export const SuccessStatusIcon: IconComponent = () => null;
export const UncheckedIcon: IconComponent = () => null;
export const WarningStatusIcon: IconComponent = () => null;
