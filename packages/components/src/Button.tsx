/**
 * SOLAR Button.
 *
 * Scaffolded once by `npm run solar:scaffold Button` from spec/components/button.json, and owned
 * by developers from then on: change it freely. What it looks like is not here. That is the recipe,
 * `solarButtonStyle` in `@bwp-web/styles/mui`, which regenerates from Figma on every
 * `solar:codegen`, so a design change reaches this component without anyone touching this file.
 * This file is behaviour: the props, the slots, loading, and accessibility.
 *
 * It wraps MUI's Button, which supplies focus handling, keyboard activation, the disabled and
 * loading states and their classes; the recipe restyles it. The app must load
 * `@bwp-web/styles/tokens.css`, since every recipe value is a `var(--solar-*)`.
 */

import MuiButton, {
  type ButtonProps as MuiButtonProps,
} from '@mui/material/Button';
import { forwardRef, type ReactNode } from 'react';
import { solarButtonStyle, type SolarButtonProps } from '@bwp-web/styles/mui';

export interface ButtonProps
  extends
    SolarButtonProps,
    Omit<
      MuiButtonProps,
      | keyof SolarButtonProps
      | 'color'
      | 'startIcon'
      | 'endIcon'
      | 'disableElevation'
    > {
  /** The icon before the label. It reinforces the action: a bin beside "Delete". */
  iconLeading?: ReactNode;
  /** The icon after the label. It indicates direction: an arrow beside "Continue". */
  iconTrailing?: ReactNode;
  /** A count shown after the label. */
  counter?: ReactNode;
}

// Through globalThis, because `process` exists only where a bundler or Node provides it, and a
// browser library should not need Node's types to say so.
const DEV =
  (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env
    ?.NODE_ENV !== 'production';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      size,
      variant,
      disabled,
      loading,
      danger,
      iconLeading,
      iconTrailing,
      counter,
      children,
      sx,
      ...rest
    },
    ref,
  ) {
    // SOLAR: an icon-only button always needs an accessible name.
    if (DEV && !children && !rest['aria-label'] && !rest['aria-labelledby'])
      // eslint-disable-next-line no-console -- a development-only accessibility warning, on purpose
      console.warn('SOLAR Button: an icon-only button needs an aria-label.');

    return (
      <MuiButton
        ref={ref}
        {...rest}
        disabled={disabled}
        loading={loading}
        startIcon={iconLeading}
        endIcon={iconTrailing}
        // SOLAR's states have their own colours; MUI's ripple and elevation would paint over them.
        disableRipple
        disableElevation
        sx={[
          solarButtonStyle({ size, variant, disabled, loading, danger }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {children}
        {counter != null && (
          <span className="SolarButton-counter">{counter}</span>
        )}
      </MuiButton>
    );
  },
);
