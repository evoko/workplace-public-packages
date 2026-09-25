/**
 * SOLAR Banner.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarBannerTree` and `solarBannerSlots` beside the recipe. What it looks like is not here. That
 * is the recipe, `solarBannerStyle` and `solarBannerCompose` in `@bwp-web/styles/mui`: each type's
 * fill and icon, and the message's and action's text styles.
 *
 * A bold, full-width message for a page or the app, more urgent than an Alert: one line, cut short
 * where it runs out of room, with SOLAR's icon for its type. Offer at most one action, a Button
 * (`primaryButton` or `secondaryButton`, a SOLAR Button at sm) or the text `action`, and a close
 * button where `onClose` is given. It is announced as it appears, at once where it warns or
 * reports a danger. Bespoke: drawn from Figma's layer tree (`internal/layers.tsx`). The app must
 * load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import {
  IconClose,
  IconDanger,
  IconInfo,
  IconSuccess,
  IconWarning,
} from '@bwp-web/assets';
import { forwardRef, type ReactNode } from 'react';
import {
  solarBannerCompose,
  solarBannerStyle,
  type SolarBannerProps,
  solarBannerSlots,
  solarBannerTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

export interface BannerProps
  extends
    SolarBannerProps,
    Omit<BoxProps, keyof SolarBannerProps | 'children' | 'ref'> {
  /** The message, on one line. */
  description: ReactNode;
  /** A SOLAR Button, primary at sm, as the one action. */
  primaryButton?: ReactNode;
  /** A SOLAR Button, secondary at sm, as the one action. */
  secondaryButton?: ReactNode;
  /** The one action's words, as a link, which call `onAction`. */
  action?: ReactNode;
  /** Called by the text action. */
  onAction?: () => void;
  /** Shows a close button, which calls it. */
  onClose?: () => void;
  /** The close button's name. */
  closeLabel?: string;
}

export const Banner = forwardRef<HTMLDivElement, BannerProps>(
  function Banner(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarBanner), under the caller's own.
    const {
      type,
      description,
      primaryButton,
      secondaryButton,
      action,
      onAction,
      onClose,
      closeLabel = 'Dismiss',
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarBanner');
    const parts = solarBannerCompose({ type });
    // A slot left empty is not drawn.
    const drawn = {
      ...parts,
      primaryButton: { ...parts.primaryButton, present: primaryButton != null },
      secondaryButton: {
        ...parts.secondaryButton,
        present: secondaryButton != null,
      },
      action: { ...parts.action, present: action != null },
      close: { ...parts.close, present: onClose != null },
    };
    return (
      <Box
        ref={ref}
        role={type === 'danger' || type === 'warning' ? 'alert' : 'status'}
        {...rest}
        sx={[solarBannerStyle({ type }), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: 'SolarBanner',
          tree: solarBannerTree,
          slots: solarBannerSlots,
          parts: drawn,
          text: { description },
          icons: {
            iconInfo: <IconInfo />,
            iconSuccess: <IconSuccess />,
            iconWarning: <IconWarning />,
            iconDanger: <IconDanger />,
            primaryButton: <span>{primaryButton}</span>,
            secondaryButton: <span>{secondaryButton}</span>,
            close: (
              <button type="button" aria-label={closeLabel} onClick={onClose}>
                <IconClose />
              </button>
            ),
          },
          render: {
            action: ({ className, style }) => (
              <button
                type="button"
                className={className}
                style={style}
                onClick={onAction}
              >
                {action}
              </button>
            ),
          },
        })}
      </Box>
    );
  },
);
