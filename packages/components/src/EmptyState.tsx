/**
 * SOLAR EmptyState.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarEmptyStateTree` and `solarEmptyStateSlots` beside the recipe. What it looks like is not
 * here. That is the recipe, `solarEmptyStateStyle` and `solarEmptyStateCompose` in
 * `@bwp-web/styles/mui`: the stack’s spacing, the icon’s size and colour, and the words’ text
 * styles.
 *
 * Bespoke: a placeholder for a view with nothing to show, drawn from Figma's layer tree
 * (`internal/layers.tsx`): an icon, a title, a description and one action, a SOLAR Button at sm,
 * each where it is given. The words carry the meaning: say why it is empty and what to do next. For
 * something still loading, use a Skeleton or a Spinner. The app must load
 * `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef, type ReactNode } from 'react';
import {
  solarEmptyStateCompose,
  solarEmptyStateStyle,
  type SolarEmptyStateProps,
  solarEmptyStateSlots,
  solarEmptyStateTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

export interface EmptyStateProps
  extends
    SolarEmptyStateProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarEmptyStateProps | 'children' | 'ref' | 'title'> {
  /** What is empty. */
  icon?: ReactNode;
  /** Why it is empty, in a few words. */
  title?: ReactNode;
  /** What to do next. */
  description?: ReactNode;
  /** One SOLAR Button, secondary at sm, that does it. */
  action?: ReactNode;
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  function EmptyState(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarEmptyState), under the caller's own.
    const { icon, title, description, action, sx, ...rest } = useSolarProps(
      inProps,
      'SolarEmptyState',
    );
    const composed = solarEmptyStateCompose({});
    const parts = {
      ...composed,
      icon: { ...composed.icon, present: icon != null },
      title: { ...composed.title, present: title != null },
      description: { ...composed.description, present: description != null },
      action: { ...composed.action, present: action != null },
    };
    return (
      <Box
        component="div"
        ref={ref}
        {...rest}
        sx={[solarEmptyStateStyle({}), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: 'SolarEmptyState',
          tree: solarEmptyStateTree,
          slots: solarEmptyStateSlots,
          parts,
          text: { title, description },
          icons: { icon: <span>{icon}</span>, action: <span>{action}</span> },
        })}
      </Box>
    );
  },
);
