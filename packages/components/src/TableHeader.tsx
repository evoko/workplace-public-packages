/**
 * SOLAR TableHeader.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarTableHeaderTree` and `solarTableHeaderSlots` beside the recipe. What it looks like is not
 * here. That is the recipe, `solarTableHeaderStyle` and `solarTableHeaderCompose` in
 * `@bwp-web/styles/mui`: the strip's padding and gaps.
 *
 * The toolbar above a Table, drawn from Figma's layer tree (`internal/layers.tsx`): on desktop the
 * caller's SOLAR SearchField (`search`), Segmented Control (`segmentedControl`) and actions (Icon
 * Buttons for filters and bulk actions, `children`), spread across it; on mobile the Segmented
 * Control and the actions alone, as Figma draws it. The `breakpoint` is the app's to give (owner
 * decision 2026-09-25). What each control does is the caller's. The app must load
 * `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef, type ReactNode } from 'react';
import {
  solarTableHeaderCompose,
  solarTableHeaderStyle,
  type SolarTableHeaderProps,
  solarTableHeaderSlots,
  solarTableHeaderTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

export interface TableHeaderProps
  extends
    SolarTableHeaderProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarTableHeaderProps | 'children' | 'ref'> {
  /** A SOLAR SearchField (md): what the table shows, filtered; desktop only, as Figma draws it. */
  search?: ReactNode;
  /** A SOLAR Segmented Control (md): which view of the table. */
  segmentedControl?: ReactNode;
  /** The actions: SOLAR Icon Buttons (md, square, secondary) for filters and bulk actions. */
  children?: ReactNode;
}

export const TableHeader = forwardRef<HTMLDivElement, TableHeaderProps>(
  function TableHeader(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarTableHeader), under the caller's own.
    const {
      breakpoint = 'desktop',
      search,
      segmentedControl,
      children,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarTableHeader');
    const look = { breakpoint };
    const composed = solarTableHeaderCompose(look);
    // A slot left empty is not drawn.
    const given = (layer: keyof typeof composed, node: ReactNode) => ({
      ...composed[layer],
      present: composed[layer].present && node != null,
    });
    const parts = {
      ...composed,
      search: given('search', search),
      segmentedControl: given('segmentedControl', segmentedControl),
      segmentedControlMobile: given('segmentedControlMobile', segmentedControl),
    };
    const held = (node: ReactNode) =>
      function Held({
        className: cls,
        style,
      }: {
        className: string;
        style?: object;
      }) {
        return (
          <span className={cls} style={style}>
            {node}
          </span>
        );
      };
    return (
      <Box
        ref={ref}
        {...rest}
        sx={[solarTableHeaderStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: 'SolarTableHeader',
          tree: solarTableHeaderTree,
          slots: solarTableHeaderSlots,
          parts,
          content: { actions: children, actionsMobile: children },
          render: {
            search: held(search),
            segmentedControl: held(segmentedControl),
            segmentedControlMobile: held(segmentedControl),
          },
        })}
      </Box>
    );
  },
);
