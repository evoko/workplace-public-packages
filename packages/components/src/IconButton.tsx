/**
 * SOLAR Icon Button.
 *
 * Written by hand, and never regenerated. What it looks like is not here. That is the recipe,
 * `solarIconButtonStyle` in `@bwp-web/styles/mui`, which regenerates from Figma on every
 * `solar:codegen`. This file is behaviour: the props, the icon, loading, and accessibility.
 *
 * Given `active`, it is a toggle icon button (a toolbar option switched on or off): `true` draws
 * Figma's active state, the persistent on state, and it is announced pressed; `false`, off. Left
 * unset, it is an ordinary action, announced as no toggle.
 *
 * It wraps MUI's IconButton, which supplies focus handling, keyboard activation, the disabled and
 * loading states and their classes; the recipe restyles it. The app must load
 * `@bwp-web/styles/tokens.css`, since every recipe value is a `var(--solar-*)`.
 */

import { useSolarProps } from './internal/theme.js';
import MuiIconButton, {
  type IconButtonProps as MuiIconButtonProps,
} from '@mui/material/IconButton';
import { forwardRef, type ReactNode } from 'react';
import {
  solarIconButtonCompose,
  solarIconButtonStyle,
  type SolarIconButtonProps,
  type SolarSpinnerSize,
  type SolarSpinnerVariant,
} from '@bwp-web/styles/mui';
import { Spinner } from './Spinner.js';

interface IconButtonBase
  extends
    SolarIconButtonProps,
    Omit<
      MuiIconButtonProps,
      | keyof SolarIconButtonProps
      | 'color'
      | 'edge'
      | 'children'
      | 'loadingIndicator'
      | 'aria-label'
      | 'aria-labelledby'
    > {
  /** The icon, which is the whole of what the button says. */
  icon: ReactNode;
  /**
   * Switched on, for a toggle icon button: Figma's active state, announced pressed. Unset, the
   * button is no toggle.
   */
  active?: boolean;
}

/**
 * An icon alone is not a name (SOLAR, and WCAG 4.1.2), so an icon button takes an `aria-label` or
 * an `aria-labelledby`, and the types refuse one with neither.
 */
export type IconButtonProps = IconButtonBase &
  (
    | { 'aria-label': string; 'aria-labelledby'?: string }
    | { 'aria-label'?: string; 'aria-labelledby': string }
  );

// Through globalThis, because `process` exists only where a bundler or Node provides it, and a
// browser library should not need Node's types to say so.
const DEV =
  (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env
    ?.NODE_ENV !== 'production';

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarIconButton), under the caller's own.
    const { size, shape, prio, disabled, loading, active, icon, sx, ...rest } =
      useSolarProps(inProps, 'SolarIconButton');
    // For JavaScript callers, whom the types do not reach.
    if (DEV && !rest['aria-label'] && !rest['aria-labelledby'])
      // eslint-disable-next-line no-console -- a development-only accessibility warning, on purpose
      console.warn(
        'SOLAR Icon Button: it needs an aria-label or aria-labelledby.',
      );

    // Disabled wins over loading, as in Figma's state order, so a disabled button shows no spinner.
    const busy = Boolean(loading && !disabled);
    const props = { size, shape, prio, disabled, loading, active };
    // What the loading state draws: which Spinner (Figma picks its size and style per prio; its
    // `style` axis is the Spinner's `variant` prop), and whether the icon stays.
    const whileLoading = solarIconButtonCompose(props, 'loading');
    const spinner = whileLoading.spinner;
    const showsIcon = !busy || whileLoading.icon.present !== false;

    return (
      <MuiIconButton
        // Its own recipe, not the SOLAR theme's for a stock MUI one (spec/overlay/mui-theme.yaml).
        data-solar=""
        ref={ref}
        {...rest}
        // A toggle is pressed or not; a plain action carries no aria-pressed at all.
        aria-pressed={active}
        disabled={disabled}
        loading={busy}
        loadingIndicator={
          <Spinner
            size={spinner['variant.size'] as SolarSpinnerSize}
            variant={spinner['variant.style'] as SolarSpinnerVariant}
          />
        }
        // SOLAR's states have their own colours; MUI's ripple would paint over them.
        disableRipple
        sx={[solarIconButtonStyle(props), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {showsIcon && <span className="SolarIconButton-icon">{icon}</span>}
      </MuiIconButton>
    );
  },
);
