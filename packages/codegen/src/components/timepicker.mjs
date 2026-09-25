/**
 * SOLAR TimePicker, beyond its IR: where MUI draws each layer and marks each state. Its shells are
 * files of their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A typed picker (`src/components/shared/typed.mjs`): a time typed on the locale's clock, or picked from a
 * TimePicker Dropdown floating under the field, opened by its clock icon (owner decisions
 * 2026-09-24: typed and picked; one list of times).
 */

import {
  TYPED_FLUTTER_STATES,
  typedResets,
  typedStates,
} from './shared/typed.mjs';

const ICON = 'iconClock';

export default {
  name: 'TimePicker',
  mui: {
    // The shell draws every layer itself, each with a class of its own: the field is MUI's
    // InputBase, its words the InputBase's input, its clock icon a button.
    slots: 'drawn',
    resets: typedResets('TimePicker', ICON),
    states: typedStates('TimePicker'),
    overlaps: { focus: ['hover'], 'error-focused': ['hover'] },
  },
  flutter: { states: TYPED_FLUTTER_STATES },
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // Figma's showRequired is a field's `mandatory`, as Text Input names it.
  api: {
    react: { label: 'label', required: 'mandatory' },
    // Flutter's word for a field that takes input (rule 5, owner decision 2026-09-25).
    flutter: { required: 'mandatory', disabled: { not: 'enabled' } },
  },
};
