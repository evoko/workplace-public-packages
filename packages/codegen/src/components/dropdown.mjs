/**
 * SOLAR Dropdown, beyond its IR: where MUI draws each layer and marks each state. Its shells are
 * files of their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A picker (`src/components/shared/picker.mjs`), the same control as Select in its own look (owner decision
 * 2026-09-24): a leading icon, a chevron that turns up while open, and a Dropdown Menu as its
 * panel, since Figma draws it none.
 */

import { fieldStates } from './shared/field.mjs';
import { pickerResets } from './shared/picker.mjs';

const picker = {
  value: 'fieldLabel',
  chevron: 'iconChevronDown',
  chevronOpen: 'iconChevronUp',
  panel: null,
  icons: ['leadingIcon', 'trailingIcon'],
};

export default {
  name: 'Dropdown',
  mui: {
    // The shell draws every layer itself, each with a class of its own: the field is MUI's
    // InputBase around the Select's combobox, and the panel MUI's menu drawn as a Dropdown Menu.
    slots: 'drawn',
    resets: pickerResets('Dropdown', picker),
    // Hovered and focused as the field is; open, in error and disabled by the shell's classes.
    states: fieldStates('Dropdown', ['open', 'error', 'disabled']),
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  api: {
    react: { label: 'label' },
    // Flutter's word for a field that takes input (rule 5, owner decision 2026-09-25).
    flutter: { disabled: { not: 'enabled' } },
  },
};
