/**
 * SOLAR Token Input, beyond its IR: where MUI draws each layer and marks each state. Its shells are
 * files of their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A field of entries it holds (owner decision 2026-09-24), each a SOLAR Tag, those past
 * \`maxVisible\` counted by a SOLAR Counter, and an input for the next: MUI's InputBase on the web,
 * an undecorated TextField in Flutter. Filled follows the entries and active the draft (the
 * overlay's `derive`).
 */

import { fieldResets } from './shared/field.mjs';

const P = 'SolarTokenInput';

export default {
  name: 'Token Input',
  mui: {
    // The shell draws every layer itself, each with a class of its own: the tokens are SOLAR Tags,
    // the input MUI's InputBase, in the field's row of tags.
    slots: 'drawn',
    resets: fieldResets('Token Input', {
      input: 'addItems',
      more: {
        // InputBase's own box around the input takes no part in the row's layout.
        [`& .${P}-words`]: { display: 'contents' },
        // The input takes the room the tokens leave, never less than a few characters.
        [`& .${P}--addItems.MuiInputBase-input`]: { minWidth: '4ch' },
        // The tokens keep their size; the row cuts off what does not fit (maxVisible counts it).
        [`& .${P}--tags`]: { minWidth: '0', overflow: 'hidden' },
        [`& .${P}--tags > *`]: { flexShrink: '0' },
      },
    }),
    // Hovered as the field is, and focused as the InputBase in it is; active (typing), filled,
    // read-only, in error and disabled by the shell's classes.
    states: {
      default: null,
      hover: `&:has(.${P}--field:hover)`,
      focus: `&:has(.${P}--field .Mui-focused)`,
      active: `&.${P}-active`,
      filled: `&.${P}-filled`,
      readonly: `&.${P}-readonly`,
      error: `&.${P}-error`,
      disabled: `&.${P}-disabled`,
    },
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // A field's label is its `label`, as Text Input's is.
  // Flutter holds the draft in its controller.
  api: {
    react: { label: 'label' },
    // Flutter's word for a field that takes input (rule 5, owner decision 2026-09-25).
    flutter: { inputValue: 'controller', disabled: { not: 'enabled' } },
  },
};
