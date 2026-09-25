/**
 * SOLAR List.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarListTree` and `solarListSlots` beside the recipe. What it looks like is not here. That is
 * the recipe, `solarListStyle` and `solarListCompose` in `@bwp-web/styles/mui`: the container's
 * edge, corners and shadow, in a card or not, and its rows' compactness.
 *
 * The container of ListItems, a list, drawn from Figma's layer tree (`internal/layers.tsx`), a
 * Divider between each two unless `dividers` is false. `inCard` draws it as Figma draws its
 * in-card list; its rows take its compactness, as Figma draws them. For navigation, settings and
 * pickers; for data in columns, use a Table. The app must load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import {
  Children,
  createContext,
  forwardRef,
  useContext,
  type ReactNode,
} from 'react';
import {
  solarListCompose,
  solarListStyle,
  type SolarListProps,
  solarListSlots,
  solarListTree,
} from '@bwp-web/styles/mui';
import { Divider } from './Divider.js';
import { drawChildren } from './internal/layers.js';

const ListContext = createContext<boolean | undefined>(undefined);

/** Whether the List around a row makes it compact; undefined outside one. */
export const useListCompact = () => useContext(ListContext);

export interface ListProps
  extends
    SolarListProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarListProps | 'children' | 'ref'> {
  /** The rows: ListItems. */
  children: ReactNode;
  /** Whether a Divider goes between each two rows, as Figma draws them; true by default. */
  dividers?: boolean;
}

export const List = forwardRef<HTMLDivElement, ListProps>(
  function List(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarList), under the caller's own.
    const {
      inCard,
      children,
      dividers = true,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarList');
    const look = { inCard };
    const parts = solarListCompose(look);
    // The rows' compactness, as the recipe says Figma draws them in this list.
    const compact = parts.listItem?.['variant.compact'] === 'true';
    const rows = Children.toArray(children);
    return (
      <ListContext.Provider value={compact}>
        <Box
          ref={ref}
          {...rest}
          sx={[solarListStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
        >
          {drawChildren('root', {
            prefix: 'SolarList',
            tree: solarListTree,
            slots: solarListSlots,
            parts,
            content: {
              items: rows.map((row, i) => (
                <li key={i}>
                  {row}
                  {dividers && i < rows.length - 1 ? (
                    <Divider aria-hidden />
                  ) : null}
                </li>
              )),
            },
            render: {
              items: ({ className, style, children: items }) => (
                <ul className={className} style={style}>
                  {items}
                </ul>
              ),
            },
          })}
        </Box>
      </ListContext.Provider>
    );
  },
);
