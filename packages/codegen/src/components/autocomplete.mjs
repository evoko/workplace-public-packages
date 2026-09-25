/**
 * SOLAR Autocomplete, beyond its IR: where MUI draws each layer and marks each state. Its shells
 * are files of their own, written by hand. One file per component, so adding one edits nothing
 * shared; `src/components/index.mjs` finds them.
 *
 * A field (`src/components/shared/field.mjs`) that suggests options as the user types: MUI's useAutocomplete
 * over Text Input's field on the web, RawAutocomplete in Flutter; the suggestions a Dropdown Menu
 * floated under the field by Autocomplete Open's gap, which is its open look (owner decision
 * 2026-09-24).
 */

import { fieldResets, fieldStates } from './shared/field.mjs';

export default {
  name: 'Autocomplete',
  mui: {
    // The shell draws every layer itself, each with a class of its own: the field is MUI's
    // InputBase, and its words the InputBase's input.
    slots: 'drawn',
    resets: fieldResets('Autocomplete', {
      input: 'search',
      icons: ['leadingIcon', 'trailingIcon'],
    }),
    // Hovered and focused as the field is; filled, in error and disabled by the props, as classes.
    states: fieldStates('Autocomplete', ['filled', 'error', 'disabled']),
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // Its words, typed or the caller's, are its controller's.
  api: {
    react: { label: 'label' },
    // Flutter's word for a field that takes input (rule 5, owner decision 2026-09-25).
    flutter: { inputValue: 'controller', disabled: { not: 'enabled' } },
  },
};
