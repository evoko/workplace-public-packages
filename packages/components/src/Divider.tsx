/**
 * SOLAR Divider.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarDividerTree` and `solarDividerSlots` beside the recipe. What it looks like is not here.
 * That is the recipe, `solarDividerStyle` and `solarDividerCompose` in `@bwp-web/styles/mui`: the
 * rule’s colour and thickness, the label’s text style, and each type’s gap and inset.
 *
 * Bespoke: a rule, an inset rule, or a label between two rules, drawn from Figma’s layer tree
 * (`internal/layers.tsx`). It fills what it separates: a horizontal divider the width it is given,
 * a vertical one the height of the row or grid cell it sits in, which stretches it. Figma draws a
 * vertical divider full only (its description names the inset and labelled types for a horizontal
 * one), so the types refuse a vertical inset or labelled one, and a vertical divider is drawn full
 * whatever `type` it is given. A screen reader hears a separator, and a labelled one’s label. The
 * app must load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef, type ReactNode } from 'react';
import {
  solarDividerCompose,
  solarDividerStyle,
  type SolarDividerProps,
  type SolarDividerType,
  solarDividerSlots,
  solarDividerTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

/**
 * Figma draws a horizontal divider full, inset or labelled, and a vertical one full only: the
 * recipe's vertical inset and labelled looks are composed from the two axes, and Figma draws
 * neither.
 */
export type DividerLook =
  | { orientation?: 'horizontal'; type?: SolarDividerType }
  | { orientation: 'vertical'; type?: 'full' };

export type DividerProps = DividerLook &
  // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
  Omit<BoxProps, keyof SolarDividerProps | 'children' | 'ref'> & {
    /** For `with-label`: the words between the rules ("Or"). */
    children?: ReactNode;
  };

export const Divider = forwardRef<HTMLDivElement, DividerProps>(
  function Divider(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarDivider), under the caller's own.
    const {
      orientation,
      type: typeProp,
      children,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarDivider');
    // A vertical divider is full, whatever it is given (a caller untyped, or a theme's default).
    const type = orientation === 'vertical' ? 'full' : typeProp;
    const parts = solarDividerCompose({ orientation, type });
    return (
      <Box
        component="div"
        ref={ref}
        role="separator"
        aria-orientation={
          orientation === 'vertical' ? 'vertical' : 'horizontal'
        }
        aria-label={typeof children === 'string' ? children : undefined}
        {...rest}
        sx={[
          solarDividerStyle({ orientation, type }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {drawChildren('root', {
          prefix: 'SolarDivider',
          tree: solarDividerTree,
          slots: solarDividerSlots,
          parts,
          text: { label: children },
        })}
      </Box>
    );
  },
);
