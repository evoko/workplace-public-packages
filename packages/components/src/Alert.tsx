/**
 * SOLAR Alert.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarAlertTree` and `solarAlertSlots` beside the recipe. What it looks like is not here. That is
 * the recipe, `solarAlertStyle` and `solarAlertCompose` in `@bwp-web/styles/mui`: each type's fill,
 * edge and words, filled or outlined, and the StatusIndicator it shows.
 *
 * A callout in the page, of a status: a title, a description and one action, each shown where it is given, beside the StatusIndicator of its type. It is announced as it appears, at once where it warns or reports a danger. A callout of its full size, for a page or a panel; inside cards and narrower panels, use Alert Small. Bespoke: drawn from Figma's layer tree
 * (`internal/layers.tsx`). The app must load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef, type ReactNode } from 'react';
import {
  solarAlertCompose,
  solarAlertStyle,
  type SolarAlertProps,
  solarAlertSlots,
  solarAlertTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';
import {
  StatusIndicator,
  type StatusIndicatorProps,
} from './StatusIndicator.js';

export interface AlertProps
  extends
    SolarAlertProps,
    Omit<BoxProps, keyof SolarAlertProps | 'title' | 'children' | 'ref'> {
  /** What happened, in a few words. */
  title?: ReactNode;
  /** What it means, and what to do. */
  description?: ReactNode;
  /** The one action's words, which call `onAction`. */
  action?: ReactNode;
  /** Called by the action. */
  onAction?: () => void;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  function Alert(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarAlert), under the caller's own.
    const { type, variant, title, description, action, onAction, sx, ...rest } =
      useSolarProps(inProps, 'SolarAlert');
    const parts = solarAlertCompose({ type, variant });
    const dot = parts.statusIndicator;
    // A slot left empty is not drawn.
    const drawn = {
      ...parts,
      title: { ...parts.title, present: title != null },
      description: { ...parts.description, present: description != null },
      action: { ...parts.action, present: action != null },
    };
    return (
      <Box
        ref={ref}
        role={type === 'danger' || type === 'warning' ? 'alert' : 'status'}
        {...rest}
        sx={[
          solarAlertStyle({ type, variant }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {drawChildren('root', {
          prefix: 'SolarAlert',
          tree: solarAlertTree,
          slots: solarAlertSlots,
          parts: drawn,
          text: { title, description },
          render: {
            // The mark is a StatusIndicator, in the type the recipe names, in its layer's element;
            // decorative, as the words say the status.
            statusIndicator: ({ className, style }) => (
              <span className={className} style={style}>
                <StatusIndicator
                  type={dot['variant.type'] as StatusIndicatorProps['type']}
                  size={dot['variant.size'] as StatusIndicatorProps['size']}
                />
              </span>
            ),
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
