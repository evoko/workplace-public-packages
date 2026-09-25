/**
 * SOLAR DatePicker, beyond its IR: where MUI draws each layer and marks each state. Its shells are
 * files of their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A typed picker (`src/components/shared/typed.mjs`): a date typed in the locale's figures, or picked from a
 * Date Picker Open floating under the field, opened by its calendar icon (owner decision
 * 2026-09-24: typed and picked).
 */

import {
  TYPED_FLUTTER_STATES,
  typedResets,
  typedStates,
} from './shared/typed.mjs';

const ICON = 'iconCalendar';

export default {
  name: 'DatePicker',
  mui: {
    // The shell draws every layer itself, each with a class of its own: the field is MUI's
    // InputBase, its words the InputBase's input, its calendar icon a button.
    slots: 'drawn',
    resets: typedResets('DatePicker', ICON),
    states: typedStates('DatePicker'),
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
