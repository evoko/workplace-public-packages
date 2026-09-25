/**
 * SOLAR PropertyList.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarPropertyListTree` and `solarPropertyListSlots` beside the recipe. What it looks like is not
 * here. That is the recipe, `solarPropertyListStyle` and `solarPropertyListCompose` in
 * `@bwp-web/styles/mui`: the list's surface, edge and corners, in a card or not.
 *
 * The container of an entity's read-only label–value pairs, drawn from Figma's layer tree
 * (`internal/layers.tsx`): the caller's PropertyRows (`children`), in a <dl>, so each row's label
 * and value stay paired, a Divider between each two unless `dividers` is false. `inCard` draws it
 * as Figma's in-card list, surfaced and edged, and its rows with it. For editable fields use a
 * form; for tabular data a Table. The app must load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import {
  Children,
  createContext,
  forwardRef,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import {
  solarPropertyListCompose,
  solarPropertyListStyle,
  type SolarPropertyListProps,
  solarPropertyListSlots,
  solarPropertyListTree,
} from '@bwp-web/styles/mui';
import { Divider } from './Divider.js';
import { drawChildren } from './internal/layers.js';

const PropertyListContext = createContext<{ inCard: boolean } | null>(null);

/** The PropertyList around a row, its in-card look; null outside one. */
export const usePropertyList = () => useContext(PropertyListContext);

export interface PropertyListProps
  extends
    SolarPropertyListProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarPropertyListProps | 'children' | 'ref'> {
  /** The rows: PropertyRows. */
  children: ReactNode;
  /** Whether a Divider goes between each two rows, as Figma draws them; true by default. */
  dividers?: boolean;
}

export const PropertyList = forwardRef<HTMLDivElement, PropertyListProps>(
  function PropertyList(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarPropertyList), under the caller's own.
    const {
      inCard = true,
      children,
      dividers = true,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarPropertyList');
    const look = { inCard };
    const parts = solarPropertyListCompose(look);
    const scope = useMemo(() => ({ inCard }), [inCard]);
    const rows = Children.toArray(children);
    return (
      <PropertyListContext.Provider value={scope}>
        <Box
          ref={ref}
          {...rest}
          sx={[
            solarPropertyListStyle(look),
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
        >
          {drawChildren('root', {
            prefix: 'SolarPropertyList',
            tree: solarPropertyListTree,
            slots: solarPropertyListSlots,
            parts,
            content: {
              items: rows.flatMap((row, i) =>
                dividers && i > 0
                  ? [<Divider key={`divider${i}`} aria-hidden />, row]
                  : [row],
              ),
            },
            render: {
              items: ({ className, style, children: items }) => (
                <dl className={className} style={style}>
                  {items}
                </dl>
              ),
            },
          })}
        </Box>
      </PropertyListContext.Provider>
    );
  },
);
