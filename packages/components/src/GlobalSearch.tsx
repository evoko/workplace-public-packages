/**
 * SOLAR GlobalSearch.
 *
 * Scaffolded once by `npm run solar:scaffold GlobalSearch` from spec/components/globalsearch.json,
 * and owned by developers from then on: change it freely. What it looks like is not here. That is
 * the recipe, `solarGlobalSearchStyle` and `solarGlobalSearchCompose` in `@bwp-web/styles/mui`: its
 * fill, edge and focus ring by state, and its words' and icon's ink.
 *
 * The entry to search across the product, usually in the app's header: a trigger drawn as a field,
 * not a field. It shows `placeholder` ("Search"), or the `query` the app's search holds (drawn
 * filled), and `onClick` opens the app's search overlay (a command palette), which takes the typing.
 * `shortcut` shows the key that opens it too in a Kbd ("⌘K", "/"); binding that key is the app's. It
 * is a button, named by its words. For a search of one list or table, use a SearchField. The app
 * must load `@bwp-web/styles/tokens.css`.
 */

import { IconSearch } from '@bwp-web/assets';
import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef } from 'react';
import {
  solarGlobalSearchCompose,
  solarGlobalSearchStyle,
  type SolarGlobalSearchProps,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';
import { Kbd, type KbdProps } from './Kbd.js';

/** Each layer's children, as Figma nests them. */
const TREE: Record<string, string[]> = {
  root: ['iconSearch', 'searchWorkplace', 'kbd'],
};

export interface GlobalSearchProps
  extends
    SolarGlobalSearchProps,
    Omit<
      BoxProps<'button'>,
      keyof SolarGlobalSearchProps | 'children' | 'ref'
    > {
  /** What it searches, while the app's search holds no query. */
  placeholder?: string;
  /** The query the app's search holds, shown in the placeholder's place. */
  query?: string;
  /** The key that opens the search too, in a Kbd ("⌘K", "/"), where the app binds one. */
  shortcut?: string;
}

export const GlobalSearch = forwardRef<HTMLButtonElement, GlobalSearchProps>(
  function GlobalSearch(
    {
      error,
      size,
      placeholder = 'Search',
      query,
      shortcut,
      className,
      sx,
      ...rest
    },
    ref,
  ) {
    // Filled where it shows a query, whose words are then the query's, not the placeholder's.
    const filled = query != null && query !== '';
    const look = { error, size, filled };
    const parts = solarGlobalSearchCompose(look);
    return (
      <Box
        component="button"
        type="button"
        ref={ref}
        {...rest}
        className={
          [
            filled ? 'SolarGlobalSearch-filled' : null,
            error ? 'SolarGlobalSearch-error' : null,
            className,
          ]
            .filter(Boolean)
            .join(' ') || undefined
        }
        sx={[solarGlobalSearchStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: 'SolarGlobalSearch',
          tree: TREE,
          // The Kbd shows where the app binds a shortcut.
          parts: { ...parts, kbd: { ...parts.kbd, present: shortcut != null } },
          text: { searchWorkplace: filled ? query : placeholder },
          icons: { iconSearch: <IconSearch /> },
          render: {
            // A SOLAR Kbd, in the variant the recipe names, in its layer's element.
            kbd: ({ className: layer, style }) => (
              <span className={layer} style={style} aria-hidden>
                <Kbd type={parts.kbd?.['variant.type'] as KbdProps['type']}>
                  {shortcut}
                </Kbd>
              </span>
            ),
          },
        })}
      </Box>
    );
  },
);
