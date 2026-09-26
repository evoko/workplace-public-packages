/**
 * GlobalSearch's Playground: a trigger drawn as a field, not a field, so nothing is typed in it: its
 * words the `placeholder` extra (Figma's "Search Workplace"; cleared, the shell's "Search"), or the `query` extra where it holds
 * any (the app's search holds a query, drawn filled); its key the `shortcut` extra (Figma's "⌘K"),
 * none where cleared. A click, which opens the app's search, is logged.
 */

import {
  GlobalSearch,
  type GlobalSearchProps,
} from '../../src/GlobalSearch.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <GlobalSearch
      size={p.choice<NonNullable<GlobalSearchProps['size']>>('size')}
      error={p.flag('error')}
      placeholder={p.words('placeholder')}
      query={p.words('query')}
      shortcut={p.words('shortcut')}
      onClick={() => p.log('onClick')}
    />
  ),
} satisfies PlaygroundBuilder;
