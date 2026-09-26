/**
 * Autocomplete's Playground: five sample suggestions (samples.ts), which the words typed filter.
 * The words in the field are the `value` extra, which typing sets and choosing a suggestion fills,
 * as Flutter's field holds them: the field is free (MUI's `freeSolo`), so words that match no
 * suggestion stay, as in Flutter, and are not put back on blur. Its label is shown by the `label`
 * toggle, in the `label text` extra's words; its helper, icons, size and states from their
 * controls, a cleared helper left out, mandatory while `mandatory` holds any text. It shows
 * Figma's "Search..." while empty, which names it where it is unlabelled.
 */

import {
  Autocomplete,
  type AutocompleteProps,
} from '../../src/Autocomplete.js';
import { cities } from './samples.js';
import type { Playground, PlaygroundBuilder } from './types.js';

/** The Autocomplete, over the `value` extra; `open` forces its suggestions open (Autocomplete Open). */
export function playgroundAutocomplete(
  p: Playground,
  props: Partial<AutocompleteProps<string>>,
) {
  return (
    <Autocomplete<string>
      options={cities}
      freeSolo
      placeholder="Search..."
      inputValue={p.text('value')}
      onInputChange={(_, words) => {
        p.set('value', words);
        p.log('onInputChange', words);
      }}
      onChange={(_, chosen) => p.log('onChange', chosen)}
      onOpen={() => p.log('onOpen')}
      onClose={() => p.log('onClose')}
      {...props}
    />
  );
}

export default {
  render: (p) => {
    const label = p.flag('label') ? p.text('label text') : undefined;
    return playgroundAutocomplete(p, {
      size: p.choice<NonNullable<AutocompleteProps<string>['size']>>('size'),
      disabled: p.flag('disabled'),
      error: p.flag('error'),
      label: label || undefined,
      mandatory: p.words('mandatory') !== undefined,
      helper: p.words('helper'),
      leadingIcon: p.icon('leadingIcon'),
      trailingIcon: p.icon('trailingIcon'),
    });
  },
} satisfies PlaygroundBuilder;
