/**
 * SOLAR Button.
 *
 * Written by hand, and never regenerated. What it looks like is not here. That is the recipe,
 * `solarButtonStyle` in `@bwp-web/styles/mui`, which regenerates from Figma on every
 * `solar:codegen`, so a design change reaches this component without anyone touching this file.
 * This file is behaviour: the props, the slots, loading, and accessibility.
 *
 * It wraps MUI's Button, which supplies focus handling, keyboard activation, the disabled and
 * loading states and their classes; the recipe restyles it. The app must load
 * `@bwp-web/styles/tokens.css`, since every recipe value is a `var(--solar-*)`.
 */

import { useSolarProps } from './internal/theme.js';
import MuiButton, {
  type ButtonProps as MuiButtonProps,
} from '@mui/material/Button';
import { forwardRef, type ReactNode } from 'react';
import {
  solarButtonCompose,
  solarButtonStyle,
  type SolarButtonProps,
  type SolarSpinnerSize,
  type SolarSpinnerVariant,
} from '@bwp-web/styles/mui';
import { Spinner } from './Spinner.js';

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
  function Button(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarButton), under the caller's own.
    const {
      size,
      prio,
      disabled,
      loading,
      danger,
      iconLeading,
      iconTrailing,
      counter,
      children,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarButton');
    // SOLAR: an icon-only button always needs an accessible name.
    if (DEV && !children && !rest['aria-label'] && !rest['aria-labelledby'])
      // eslint-disable-next-line no-console -- a development-only accessibility warning, on purpose
      console.warn('SOLAR Button: an icon-only button needs an aria-label.');

    // Which Spinner the loading state shows -- Figma picks its size and style per Button prio.
    // Figma's `style` axis is the Spinner's `variant` prop.
    const spinner = solarButtonCompose(
      { size, prio, disabled, loading, danger },
      'loading',
    ).spinner;

    return (
      <MuiButton
        // Its own recipe, not the SOLAR theme's for a stock MUI one (spec/overlay/mui-theme.yaml).
        data-solar=""
        ref={ref}
        {...rest}
        disabled={disabled}
        // Disabled wins over loading, as in Figma's state order, so a disabled button shows no spinner.
        loading={loading && !disabled}
        startIcon={iconLeading}
        endIcon={iconTrailing}
        loadingIndicator={
          <Spinner
            size={spinner['variant.size'] as SolarSpinnerSize}
            variant={spinner['variant.style'] as SolarSpinnerVariant}
          />
        }
        // SOLAR's states have their own colours; MUI's ripple would paint over them. MUI draws
        // elevation only for its contained variant, so its own variant is pinned to text: an app
        // theme defaulting Buttons to contained cannot bring Material's shadows back.
        // (disableElevation would not do: it writes box-shadow none on hover and press, over
        // SOLAR's control shadow.)
        variant="text"
        disableRipple
        sx={[
          solarButtonStyle({ size, prio, disabled, loading, danger }),
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
