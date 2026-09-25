/**
 * SOLAR Select, beyond its IR: where MUI draws each layer and marks each state. Its shells are
 * files of their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A picker (`src/components/shared/picker.mjs`): a field that opens a panel of Dropdown Items under it, the
 * panel drawn from Select's own layer as Figma draws it (owner decision 2026-09-24). MUI's Select
 * on the web, a drawn field and SolarMenuAnchor in Flutter.
 */

import { pickerResets } from './shared/picker.mjs';
import { fieldStates } from './shared/field.mjs';

export default {
  name: 'Select',
  mui: {
    // The shell draws every layer itself, each with a class of its own: the field is MUI's
    // InputBase around the Select's combobox, and the panel MUI's menu, kept in the component so
    // the recipe reaches it.
    slots: 'drawn',
    resets: pickerResets('Select', {
      value: 'placeholder',
      chevron: 'trailingIcon',
      panel: 'dropdownMenu',
    }),
    // Hovered and focused as the field is; open, in error and disabled by the shell's classes.
    states: fieldStates('Select', ['open', 'error', 'disabled']),
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // The trailing icon is the chevron, which the shell draws.
  api: {
    react: { label: 'label', trailingIcon: null },
    // Flutter's word for a field that takes input (rule 5, owner decision 2026-09-25).
    flutter: { trailingIcon: null, disabled: { not: 'enabled' } },
  },
};
