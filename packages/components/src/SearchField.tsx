/**
 * SOLAR SearchField.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarSearchFieldTree` and `solarSearchFieldSlots` beside the recipe. What it looks like is not
 * here. That is the recipe, `solarSearchFieldStyle` and `solarSearchFieldCompose` in
 * `@bwp-web/styles/mui`: the field's fill, edge and focus ring by state, and its query's and icons'
 * ink.
 *
 * A local search, filtering the list or table beside it as the user types: SOLAR's search icon
 * before the query, and a `filter` after it (an IconButton that opens the filters, or clears the
 * query). The field is MUI's InputBase, a native search input, so every InputBase prop but its
 * adornments reaches it (`value` or `defaultValue`, `onChange`, `placeholder`, `inputRef`); it is
 * named "Search" unless its `inputProps` name it otherwise. It is drawn filled where it holds a
 * query. Debounce the filtering, and announce the count of results in a live region. For search
 * across the product, use a GlobalSearch. The app must load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import { IconSearch } from '@bwp-web/assets';
import InputBase, { type InputBaseProps } from '@mui/material/InputBase';
import { useControlled } from '@mui/material/utils';
import { forwardRef, type ReactNode } from 'react';
import {
  solarSearchFieldCompose,
  solarSearchFieldStyle,
  type SolarSearchFieldProps,
  solarSearchFieldSlots,
  solarSearchFieldTree,
} from '@bwp-web/styles/mui';
import { drawLayer, type LayerDrawing } from './internal/layers.js';

export interface SearchFieldProps
  extends
    SolarSearchFieldProps,
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

export const SearchField = forwardRef<HTMLDivElement, SearchFieldProps>(
  function SearchField(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarSearchField), under the caller's own.
    const {
      error,
      disabled,
      size,
      filter,
      value: valueProp,
      defaultValue,
      onChange,
      inputProps,
      className,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarSearchField');
    const [value, setValue] = useControlled<unknown>({
      controlled: valueProp,
      default: defaultValue ?? '',
      name: 'SearchField',
      state: 'value',
    });
    // Filled where it holds a query: its words are then the query's, not the placeholder's.
    const filled = value != null && String(value) !== '';
    const look = { error, disabled, size, filled };
    const parts = solarSearchFieldCompose(look);
    const drawing: LayerDrawing = {
      prefix: 'SolarSearchField',
      tree: solarSearchFieldTree,
      slots: solarSearchFieldSlots,
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
            filled ? 'SolarSearchField-filled' : null,
            error ? 'SolarSearchField-error' : null,
            disabled ? 'SolarSearchField-disabled' : null,
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
          className: ['SolarSearchField--search', inputProps?.className]
            .filter(Boolean)
            .join(' '),
        }}
        sx={[solarSearchFieldStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      />
    );
  },
);
