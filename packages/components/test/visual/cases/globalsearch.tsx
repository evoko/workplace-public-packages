import oracle from '../../../../../spec/verify/globalsearch.json';
import {
  GlobalSearch,
  type GlobalSearchProps,
} from '../../../src/GlobalSearch.js';
import type { VisualCase } from './types.js';

// Figma's words, as the query where it is filled (the oracle's content) and the placeholder
// otherwise, and Figma's own sample key in its Kbd.
export default {
  oracle,
  render: (v) => (
    <GlobalSearch
      {...(v.props as GlobalSearchProps)}
      placeholder="Search Workplace"
      query={v.content?.includes('query') ? 'Search Workplace' : undefined}
      shortcut="⌘K"
      onClick={() => {}}
    />
  ),
} satisfies VisualCase;
