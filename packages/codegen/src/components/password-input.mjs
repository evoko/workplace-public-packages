/**
 * SOLAR Password Input, beyond its IR: where MUI draws each layer and marks each state. Its shells
 * are files of their own, written by hand. One file per component, so adding one edits nothing
 * shared; `src/components/index.mjs` finds them.
 *
 * A field (shared/field.mjs) whose words are hidden: MUI's InputBase on the web, a password
 * input, and an obscured TextField in Flutter, with SOLAR's eye after it to show or hide them.
 */

import { fieldResets, fieldStates } from './shared/field.mjs';
import { targetArea } from './shared/target.mjs';

const P = 'SolarPasswordInput';

export default {
  name: 'Password Input',
  mui: {
    // The shell draws every layer itself, each with a class of its own: the field is MUI's
    // InputBase, its words the InputBase's input, and the eye a button.
    slots: 'drawn',
    resets: fieldResets('Password Input', {
      input: 'maskedValue',
      wraps: ['helper', 'forgotPassword'],
      more: {
        // The eye is a button of the icon's size, its ink the recipe's, with a 44 × 44 target
        // (shared/target.mjs).
        ...targetArea(`& button.${P}--icon`),
        [`& button.${P}--icon`]: {
          ...targetArea(`& button.${P}--icon`)[`& button.${P}--icon`],
          appearance: 'none',
          background: 'none',
          border: '0',
          padding: '0',
          margin: '0',
          cursor: 'pointer',
          flexShrink: '0',
        },
        [`& button.${P}--icon > svg`]: {
          display: 'block',
          width: '100%',
          height: '100%',
        },
      },
    }),
    // Hovered and focused as the field is; filled, in error and disabled by the props, as classes.
    states: fieldStates('Password Input', ['filled', 'error', 'disabled']),
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
