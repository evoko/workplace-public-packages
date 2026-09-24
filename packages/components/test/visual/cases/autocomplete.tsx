import oracle from '../../../../../spec/verify/autocomplete.json';
import {
  Autocomplete,
  type AutocompleteProps,
} from '../../../src/Autocomplete.js';
import { icon } from './probes.js';
import type { VisualCase } from './types.js';

// Every slot filled so its look is measured: the label, starred, the helper and both icon probes;
// holding words where Figma draws it filled (the oracle's content), controlled so they stay.
export default {
  oracle,
  render: (v) => (
    <Autocomplete<string>
      {...(v.props as Pick<
        AutocompleteProps<string>,
        'size' | 'disabled' | 'error'
      >)}
      options={['One', 'Two']}
      inputValue={v.content?.includes('inputValue') ? 'Search' : ''}
      onInputChange={() => {}}
      label="Label"
      mandatory
      helper="Helper text"
      placeholder="Search"
      leadingIcon={icon}
      trailingIcon={icon}
    />
  ),
} satisfies VisualCase;
