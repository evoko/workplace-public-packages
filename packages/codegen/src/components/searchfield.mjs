/**
 * SOLAR SearchField, beyond its IR: where MUI draws each layer and marks each state. Its shells are
 * files of their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A field (shared/field.mjs) that is all field: MUI's InputBase on the web, its root the whole
 * component, and an undecorated TextField in Flutter, with SOLAR's search icon before the query
 * and the caller's filter after it.
 */

import { fieldResets, fieldStates } from './shared/field.mjs';

const P = 'SolarSearchField';

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
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // Flutter holds a field's value in its controller.
  api: {
    // Flutter's word for a field that takes input (rule 5, owner decision 2026-09-25).
    flutter: { value: 'controller', disabled: { not: 'enabled' } },
  },
};
