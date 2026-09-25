/**
 * SOLAR Text Area, beyond its IR: where MUI draws each layer and marks each state. Its shells are
 * files of their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A field of many lines (shared/field.mjs): the label above, the footer below (the helper and
 * the count), and between them the field, MUI's InputBase, multiline, on the web and an
 * undecorated TextField in Flutter, with the caller's Icon Buttons pinned in its bottom corners.
 */

import { fieldResets, fieldStates } from './shared/field.mjs';

const P = 'SolarTextArea';

export default {
  name: 'Text Area',
  mui: {
    // The shell draws every layer itself, each with a class of its own: the field is MUI's
    // InputBase, multiline, and its words the InputBase's textarea, which fills the field.
    slots: 'drawn',
    resets: fieldResets('Text Area', {
      input: 'enterText',
      more: {
        [`& .${P}--enterText.MuiInputBase-input`]: { minHeight: '0' },
      },
    }),
    // Hovered and focused as the field is; filled, in error and disabled by the props, as classes.
    states: fieldStates('Text Area', ['filled', 'error', 'disabled']),
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // A field's label is its `label`, as Text Input's is.
  // Flutter holds a field's value in its controller.
  api: {
    react: { label: 'label' },
    // Flutter's word for a field that takes input (rule 5, owner decision 2026-09-25).
    flutter: { value: 'controller', disabled: { not: 'enabled' } },
  },
};
