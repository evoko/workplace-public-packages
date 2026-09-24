import oracle from '../../../../../spec/verify/searchfield.json';
import {
  SearchField,
  type SearchFieldProps,
} from '../../../src/SearchField.js';
import { icon } from './probes.js';
import type { VisualCase } from './types.js';

// Figma's words, holding them where it is filled (the oracle's content) and showing them as the
// placeholder otherwise; the filter an icon probe.
export default {
  oracle,
  render: (v) => (
    <SearchField
      {...(v.props as SearchFieldProps)}
      filter={icon}
      value={v.content?.includes('value') ? 'Search' : ''}
      onChange={() => {}}
      placeholder="Search"
    />
  ),
} satisfies VisualCase;
