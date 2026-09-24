/**
 * SOLAR GlobalSearch, beyond its IR: where MUI draws each layer and marks each state, and the two
 * shell templates, rendered into the shells by \`solar:codegen\` on every run. One file per
 * component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A trigger drawn as a field (owner decision 2026-09-24): a button that shows the placeholder or
 * the current query, SOLAR's search icon before it and a Kbd of its shortcut after, and opens the
 * app's search. Filled follows the query (the overlay's `derive`).
 */

import { drawnFlutter, drawnResets, treeOf } from '../shells/drawn.mjs';
import { targetArea } from '../shells/target.mjs';

const P = 'SolarGlobalSearch';

const requireLayers = (spec) => {
  if (treeOf(spec).root?.join() !== 'iconSearch,searchWorkplace,kbd')
    throw new Error(
      'GlobalSearch: its root does not hold its icon, words and Kbd',
    );
  if (spec.derived?.filled?.type !== 'boolean')
    throw new Error('GlobalSearch: its filled is not derived from its query');
};

export default {
  name: 'GlobalSearch',
  mui: {
    // The shell draws every layer itself, each with a class of its own; its root is a button.
    slots: 'drawn',
    resets: drawnResets('GlobalSearch', {
      cursor: 'pointer',
      // A button's own font and alignment give way to the recipe's.
      font: 'inherit',
      textAlign: 'start',
      '&:focus-visible': { outline: 'none' },
      // The words take the room the icon and the Kbd leave, cut short where they run out.
      [`& .${P}-searchWorkplace`]: {
        flex: '1 1 0%',
        minWidth: '0',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
      // A 44 × 44 target around it (shells/target.mjs).
      ...targetArea(),
    }),
    states: {
      default: null,
      hover: '&:hover',
      focus: '&:focus-visible',
      filled: `&.${P}-filled`,
      error: `&.${P}-error`,
    },
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireLayers(spec);
      const api = Object.keys(spec.api);
      return `/**
 * SOLAR GlobalSearch.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarGlobalSearchStyle\` and \`solarGlobalSearchCompose\` in \`@bwp-web/styles/mui\`:
 * its fill, edge and focus ring by state, and its words' and icon's ink.
 *
 * The entry to search across the product, usually in the app's header: a trigger drawn as a field,
 * not a field. It shows \`placeholder\` ("Search"), or the \`query\` the app's search holds (drawn
 * filled), and \`onClick\` opens the app's search overlay (a command palette), which takes the typing.
 * \`shortcut\` shows the key that opens it too in a Kbd ("⌘K", "/"); binding that key is the app's. It
 * is a button, named by its words. For a search of one list or table, use a SearchField. The app
 * must load \`@bwp-web/styles/tokens.css\`.
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
const TREE: Record<string, string[]> = ${JSON.stringify(treeOf(spec))};

export interface GlobalSearchProps
  extends SolarGlobalSearchProps,
    Omit<BoxProps<'button'>, keyof SolarGlobalSearchProps | 'children' | 'ref'> {
  /** What it searches, while the app's search holds no query. */
  placeholder?: string;
  /** The query the app's search holds, shown in the placeholder's place. */
  query?: string;
  /** The key that opens the search too, in a Kbd ("⌘K", "/"), where the app binds one. */
  shortcut?: string;
}

export const GlobalSearch = forwardRef<HTMLButtonElement, GlobalSearchProps>(
  function GlobalSearch(
    { ${api.join(', ')}, placeholder = 'Search', query, shortcut, className, sx, ...rest },
    ref,
  ) {
    // Filled where it shows a query, whose words are then the query's, not the placeholder's.
    const filled = query != null && query !== '';
    const look = { ${api.join(', ')}, filled };
    const parts = solarGlobalSearchCompose(look);
    return (
      <Box
        component="button"
        type="button"
        ref={ref}
        {...rest}
        className={
          [filled ? '${P}-filled' : null, error ? '${P}-error' : null, className]
            .filter(Boolean)
            .join(' ') || undefined
        }
        sx={[solarGlobalSearchStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: '${P}',
          tree: TREE,
          // The Kbd shows where the app binds a shortcut.
          parts: { ...parts, kbd: { ...parts.kbd, present: shortcut != null } },
          text: { searchWorkplace: filled ? query : placeholder },
          icons: { iconSearch: <IconSearch /> },
          render: {
            // A SOLAR Kbd, in the variant the recipe names, in its layer's element.
            kbd: ({ className: layer, style }) => (
              <span className={layer} style={style} aria-hidden>
                <Kbd type={parts.kbd?.['variant.type'] as KbdProps['type']}>{shortcut}</Kbd>
              </span>
            ),
          },
        })}
      </Box>
    );
  },
);
`;
    },
    flutter: (spec) => {
      requireLayers(spec);
      return drawnFlutter(spec, {
        look: 'its fill, edge and focus ring by state, and its words’ and icon’s ink, read cell by cell',
        about: `The entry to search across the product, usually in the app's header: a trigger drawn as a field, not a field, drawn from Figma's layer tree with [SolarLayers]. It shows [placeholder] ("Search"), or the [query] the app's search holds (drawn filled), and [onPressed] opens the app's search overlay (a command palette), which takes the typing. [shortcut] shows the key that opens it too in a SolarKbd ("⌘K", "/"); binding that key is the app's. It is a button, named by its words. For a search of one list or table, use a SolarSearchField.`,
        params: `required this.onPressed,
this.placeholder = 'Search',
this.query,
this.shortcut,`,
        fields: `/// Opens the app's search; null disables it.
final VoidCallback? onPressed;

/// What it searches, while the app's search holds no query.
final String placeholder;

/// The query the app's search holds, shown in the placeholder's place.
final String? query;

/// The key that opens the search too, in a SolarKbd ("⌘K", "/"), where the app binds one.
final String? shortcut;`,
        imports: `import '../generated/components/kbd.dart';
import 'solar_kbd.dart';`,
        prelude: `// Filled where it shows a query, whose words are then the query's, not the placeholder's.
final query = this.query;
final filled = query != null && query.isNotEmpty;`,
        values: { filled: 'filled' },
        control: { onPressed: 'onPressed', semantics: '' },
        text: `{'searchWorkplace': filled ? query : placeholder}`,
        // The words take the room the icon and the Kbd leave, cut short where they run out.
        truncates: `const {'searchWorkplace'}`,
        present: (recipe) => `l == 'kbd' ? shortcut != null : ${recipe}`,
        // A SOLAR Kbd, in the variant the recipe names, left unread: the words name the button.
        composed: `{
        if (shortcut case final keys?)
          'kbd': ExcludeSemantics(
            child: SolarKbd(
              type: SolarKbdType.values.firstWhere(
                (k) =>
                    k.figma ==
                    SolarGlobalSearchRecipe.lookup('kbd.variant.type', p, states)!
                        .substring(2),
              ),
              label: keys,
            ),
          ),
      }`,
      });
    },
  },
};
