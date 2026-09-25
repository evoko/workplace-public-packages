/**
 * SOLAR SearchField, beyond its IR: where MUI draws each layer and marks each state, and the two
 * shell templates, rendered into the shells by \`solar:codegen\` on every run. One file per
 * component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A field (shells/field.mjs) that is all field: MUI's InputBase on the web, its root the whole
 * component, and an undecorated TextField in Flutter, with SOLAR's search icon before the query
 * and the caller's filter after it.
 */

import { treeOf, treeConsts } from '../shells/drawn.mjs';
import { fieldFlutter, fieldResets, fieldStates } from '../shells/field.mjs';

const P = 'SolarSearchField';

const requireLayers = (spec) => {
  if (treeOf(spec).root?.join() !== 'iconSearch,search,filter')
    throw new Error(
      'SearchField: its root does not hold its icon, query and filter',
    );
  if (!spec.slots.filter)
    throw new Error('SearchField: the IR has no filter slot');
  if (spec.derived?.filled?.type !== 'boolean')
    throw new Error('SearchField: its filled is not derived from its value');
};

export default {
  name: 'SearchField',
  mui: {
    // The shell draws every layer itself, each with a class of its own: the root is MUI's
    // InputBase, and the query its input.
    slots: 'drawn',
    resets: fieldResets('SearchField', {
      input: 'search',
      field: null,
      icons: ['filter'],
      wraps: [],
      more: {
        // The browser's own clear button, which Figma does not draw: the caller's filter slot
        // holds a control, a clear button among them.
        [`& .${P}--search::-webkit-search-cancel-button, & .${P}--search::-webkit-search-decoration`]:
          { WebkitAppearance: 'none', appearance: 'none' },
      },
    }),
    // Hovered and focused as it is; filled, in error and disabled by the props, as classes.
    states: fieldStates('SearchField', ['filled', 'error', 'disabled'], {
      field: null,
    }),
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  shells: {
    // Flutter holds a field's value in its controller.
    flutter: { value: 'controller' },
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      const api = Object.keys(spec.api);
      return `/**
 * SOLAR SearchField.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarSearchFieldStyle\` and \`solarSearchFieldCompose\` in \`@bwp-web/styles/mui\`:
 * the field's fill, edge and focus ring by state, and its query's and icons' ink.
 *
 * A local search, filtering the list or table beside it as the user types: SOLAR's search icon
 * before the query, and a \`filter\` after it (an IconButton that opens the filters, or clears the
 * query). The field is MUI's InputBase, a native search input, so every InputBase prop but its
 * adornments reaches it (\`value\` or \`defaultValue\`, \`onChange\`, \`placeholder\`, \`inputRef\`); it is
 * named "Search" unless its \`inputProps\` name it otherwise. It is drawn filled where it holds a
 * query. Debounce the filtering, and announce the count of results in a live region. For search
 * across the product, use a GlobalSearch. The app must load \`@bwp-web/styles/tokens.css\`.
 */

import { IconSearch } from '@bwp-web/assets';
import InputBase, { type InputBaseProps } from '@mui/material/InputBase';
import { useControlled } from '@mui/material/utils';
import { forwardRef, type ReactNode } from 'react';
import {
  solarSearchFieldCompose,
  solarSearchFieldStyle,
  type SolarSearchFieldProps,
} from '@bwp-web/styles/mui';
import { drawLayer, type LayerDrawing } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
${treeConsts(spec)}

export interface SearchFieldProps
  extends SolarSearchFieldProps,
    Omit<
      InputBaseProps,
      | keyof SolarSearchFieldProps
      | 'size'
      | 'color'
      | 'fullWidth'
      | 'margin'
      | 'multiline'
      | 'rows'
      | 'minRows'
      | 'maxRows'
      | 'startAdornment'
      | 'endAdornment'
      | 'ref'
    > {
  /** After the query: an IconButton that opens the filters, or clears the query; or an icon. */
  filter?: ReactNode;
}

export const SearchField = forwardRef<HTMLDivElement, SearchFieldProps>(function SearchField(
  {
    ${api.join(',\n    ')},
    filter,
    value: valueProp,
    defaultValue,
    onChange,
    inputProps,
    className,
    sx,
    ...rest
  },
  ref,
) {
  const [value, setValue] = useControlled<unknown>({
    controlled: valueProp,
    default: defaultValue ?? '',
    name: 'SearchField',
    state: 'value',
  });
  // Filled where it holds a query: its words are then the query's, not the placeholder's.
  const filled = value != null && String(value) !== '';
  const look = { ${api.join(', ')}, filled };
  const parts = solarSearchFieldCompose(look);
  const drawing: LayerDrawing = {
    prefix: '${P}',
    tree: TREE, slots: SLOTS,
    // A filter left out is not drawn.
    parts: { ...parts, filter: { ...parts.filter, present: filter != null } },
    icons: { iconSearch: <IconSearch />, filter: <span>{filter}</span> },
  };
  return (
    <InputBase
      ref={ref}
      type="search"
      {...rest}
      value={value}
      onChange={(event) => {
        setValue(event.target.value);
        onChange?.(event);
      }}
      disabled={disabled}
      error={error}
      className={
        [
          filled ? '${P}-filled' : null,
          error ? '${P}-error' : null,
          disabled ? '${P}-disabled' : null,
          className,
        ]
          .filter(Boolean)
          .join(' ') || undefined
      }
      startAdornment={drawLayer('iconSearch', drawing)}
      endAdornment={drawLayer('filter', drawing)}
      inputProps={{
        'aria-label': 'Search',
        ...inputProps,
        className: ['${P}--search', inputProps?.className].filter(Boolean).join(' '),
      }}
      sx={[solarSearchFieldStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
    />
  );
});
`;
    },
    flutter: (spec) => {
      requireLayers(spec);
      return fieldFlutter(spec, {
        look: "the field's fill, edge and focus ring by state, and its query's and icons' ink",
        about: `A local search, filtering the list or table beside it as the user types: SOLAR's search icon before the query, and a [filter] after it (a SolarIconButton that opens the filters, or clears the query). The query is a [TextField], undecorated, in the field drawn from Figma's layer tree with [SolarLayers] ([SolarField] holds its words and states); a tap anywhere in the field focuses it. It is drawn filled where its [controller] holds a query, and hovered and focused as the field is. It reads as a text field named [semanticLabel], "Search" unless it says more. Debounce the filtering, and announce the count of results. For search across the product, use a GlobalSearch.`,
        words: 'search',
        field: 'root',
        params: `this.filter,
this.semanticLabel = 'Search',
this.onSubmitted,`,
        fields: `/// After the query: a SolarIconButton that opens the filters, or clears the query; or an icon.
final Widget? filter;

/// What it searches, for a screen reader: "Search" unless it says more.
final String semanticLabel;

/// Called with the query when the keyboard's action submits it.
final ValueChanged<String>? onSubmitted;`,
        name: 'semanticLabel',
        present: { filter: 'filter != null' },
        slots: "{'filter': ?filter}",
        textField: `textInputAction: TextInputAction.search,
onSubmitted: onSubmitted,
maxLines: 1,`,
      });
    },
  },
};
