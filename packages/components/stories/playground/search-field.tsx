/**
 * SearchField's Playground: its query the `value` extra, which typing sets; its size and states from
 * their controls; its filter the icon its control picks (Figma's filter icon at first), as Figma
 * draws it, none where `_none`. It shows Figma's "Search" while empty, and is named "Search", as
 * the shell names it.
 */

import { SearchField, type SearchFieldProps } from '../../src/SearchField.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <SearchField
      size={p.choice<NonNullable<SearchFieldProps['size']>>('size')}
      disabled={p.flag('disabled')}
      error={p.flag('error')}
      filter={p.icon('filter')}
      placeholder="Search"
      value={p.text('value')}
      onChange={(event) => {
        p.set('value', event.target.value);
        p.log('onChange', event.target.value);
      }}
    />
  ),
} satisfies PlaygroundBuilder;
