/**
 * SOLAR Text Input, beyond its IR: where MUI draws each layer and marks each state. Its shells are
 * files of their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A field: SOLAR's label above, its helper below, and between them the field, MUI's InputBase on
 * the web and an undecorated TextField in Flutter, drawn by the shared layer helpers. Filled
 * follows the value (the overlay's `derive`), which the shells track.
 */

import { fieldResets, fieldStates } from './shared/field.mjs';

export default {
  name: 'Text Input',
  mui: {
    // The shell draws every layer itself, each with a class of its own: the field is MUI's
    // InputBase, and its words the InputBase's input.
    slots: 'drawn',
    resets: fieldResets('Text Input', {
      input: 'fieldLabel',
      icons: ['leadingIcon', 'trailingIcon'],
    }),
    // Hovered and focused as the field is; filled, in error and disabled by the props, as classes.
    states: fieldStates('Text Input', ['filled', 'error', 'disabled']),
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // A field's label is its `label`, as MUI's TextField and Flutter's InputDecoration name it.
  // Flutter holds a field's value in its controller.
  api: {
    react: { label: 'label' },
    // Flutter's word for a field that takes input (rule 5, owner decision 2026-09-25).
    flutter: { value: 'controller', disabled: { not: 'enabled' } },
  },
};
