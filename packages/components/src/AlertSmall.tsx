/**
 * SOLAR Alert Small.
 *
 * Scaffolded once by `npm run solar:scaffold "Alert Small"` from spec/components/alert-small.json,
 * and owned by developers from then on: change it freely. What it looks like is not here. That is
 * the recipe, `solarAlertSmallStyle` and `solarAlertSmallCompose` in `@bwp-web/styles/mui`: each type's
 * fill, edge and words, filled or outlined, and the StatusIndicator it shows.
 *
 * A callout in the page, of a status: a title, a description and one action, each shown where it is given, beside the StatusIndicator of its type. It is announced as it appears, at once where it warns or reports a danger. The compact callout, for cards and panels where an Alert is too tall. Bespoke: drawn from Figma's layer tree
 * (`internal/layers.tsx`). The app must load `@bwp-web/styles/tokens.css`.
 */

import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef, type ReactNode } from 'react';
import {
  solarAlertSmallCompose,
  solarAlertSmallStyle,
  type SolarAlertSmallProps,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';
import {
  StatusIndicator,
  type StatusIndicatorProps,
} from './StatusIndicator.js';

/** Each layer's children, as Figma nests them. */
const TREE: Record<string, string[]> = {
  root: ['statusIndicator', 'content', 'action'],
  content: ['title', 'description'],
};

export interface AlertSmallProps
  extends
    SolarAlertSmallProps,
    Omit<BoxProps, keyof SolarAlertSmallProps | 'title' | 'children' | 'ref'> {
  /** What happened, in a few words. */
  title?: ReactNode;
  /** What it means, and what to do. */
  description?: ReactNode;
  /** The one action's words, which call `onAction`. */
  action?: ReactNode;
  /** Called by the action. */
  onAction?: () => void;
}

export const AlertSmall = forwardRef<HTMLDivElement, AlertSmallProps>(
  function AlertSmall(
    { type, variant, title, description, action, onAction, sx, ...rest },
    ref,
  ) {
    const parts = solarAlertSmallCompose({ type, variant });
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
          solarAlertSmallStyle({ type, variant }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {drawChildren('root', {
          prefix: 'SolarAlertSmall',
          tree: TREE,
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
