/**
 * SOLAR Toast.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarToastTree` and `solarToastSlots` beside the recipe. What it looks like is not here. That is
 * the recipe, `solarToastStyle` and `solarToastCompose` in `@bwp-web/styles/mui`: each status's
 * fill, edge and action colour, and the Tag drawn on the toast's surface and edge.
 *
 * A passing message about something done in the background ("File saved", "Connection lost"),
 * with a Tag saying what it is about and an optional action ("Undo"). Never for an error that
 * needs a decision: that is a Dialog. Bespoke: drawn from Figma's layer tree
 * (`internal/layers.tsx`). Where it appears, and how long it stays (4 to 7 seconds, longer for a
 * danger), is the app's: show it in MUI's Snackbar. It is announced as it appears. The app must
 * load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { IconChevronRight } from '@bwp-web/assets';
import { forwardRef, type ReactNode } from 'react';
import {
  solarToastCompose,
  solarToastStyle,
  type SolarToastProps,
  solarToastSlots,
  solarToastTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';
import { Tag, type TagProps } from './Tag.js';

export interface ToastProps
  extends
    SolarToastProps,
    Omit<BoxProps, keyof SolarToastProps | 'children' | 'ref'> {
  /** What happened, in a few words. */
  message: ReactNode;
  /** What it is about, in the Tag before the message. */
  tag?: ReactNode;
  /** The action's words ("Undo"), which call `onAction`. */
  action?: ReactNode;
  /** Called by the action. */
  onAction?: () => void;
  /** Whether a chevron follows the action, where it opens something. */
  chevron?: boolean;
}

export const Toast = forwardRef<HTMLDivElement, ToastProps>(
  function Toast(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarToast), under the caller's own.
    const {
      status,
      message,
      tag,
      action,
      onAction,
      chevron = false,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarToast');
    const parts = solarToastCompose({ status });
    const t = parts.tag;
    // A slot left empty is not drawn.
    const drawn = {
      ...parts,
      tag: { ...t, present: tag != null },
      action: { ...parts.action, present: action != null },
      chevron: { ...parts.chevron, present: action != null && chevron },
    };
    return (
      <Box
        ref={ref}
        role={status === 'danger' ? 'alert' : 'status'}
        {...rest}
        sx={[solarToastStyle({ status }), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: 'SolarToast',
          tree: solarToastTree,
          slots: solarToastSlots,
          parts: drawn,
          text: { message },
          icons: { chevron: <IconChevronRight /> },
          render: {
            // A SOLAR Tag, in the variant the recipe names, in its layer's element; the recipe draws
            // it on the toast's surface and edge.
            tag: ({ className, style }) => (
              <span className={className} style={style}>
                <Tag
                  status={t['variant.status'] as TagProps['status']}
                  indicator
                >
                  {tag}
                </Tag>
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
