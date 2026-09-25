/**
 * SOLAR Number Input, beyond its IR: where MUI draws each layer and marks each state. Its shells
 * are files of their own, written by hand. One file per component, so adding one edits nothing
 * shared; `src/components/index.mjs` finds them.
 *
 * A field (shared/field.mjs) of a number, a spinbutton: MUI's InputBase on the web and an
 * undecorated TextField in Flutter, stepped by the arrow keys and by its stepper's buttons, inline
 * (a minus and a plus either side) or beside it (a column of chevrons).
 */

import { fieldResets, fieldStates } from './shared/field.mjs';
import { targetArea } from './shared/target.mjs';

const P = 'SolarNumberInput';

/** A stepper's button: a box of the recipe's size, its ink the recipe's, with no face of its own. */
const button = {
  appearance: 'none',
  background: 'none',
  border: '0',
  padding: '0',
  margin: '0',
  font: 'inherit',
  cursor: 'pointer',
  '&:disabled': { cursor: 'default' },
};

export default {
  name: 'Number Input',
  mui: {
    // The shell draws every layer itself, each with a class of its own: the field is MUI's
    // InputBase, its number the InputBase's input, and the steppers buttons.
    slots: 'drawn',
    resets: fieldResets('Number Input', {
      input: 'value',
      more: {
        // Inline, the number is as wide as its digits, and the field hugs it.
        [`& .${P}--inlineValue.MuiInputBase-input`]: {
          flex: '0 0 auto',
          width: 'auto',
          minWidth: '1ch',
          height: 'auto',
          padding: '0',
          fieldSizing: 'content',
          WebkitTextFillColor: 'currentcolor',
          textAlign: 'center',
        },
        [`& button.${P}--fieldDecrement, & button.${P}--fieldIncrement`]: {
          ...button,
          flexShrink: '0',
          position: 'relative',
        },
        [`& button.${P}--fieldDecrement > svg, & button.${P}--fieldIncrement > svg`]:
          {
            display: 'block',
            width: '100%',
            height: '100%',
          },
        // The inline buttons have a 44 × 44 target each (shared/target.mjs); the side stepper's
        // halves, stacked 20px tall, cannot without covering each other, and keep Figma's.
        ...targetArea(`& button.${P}--fieldDecrement`),
        ...targetArea(`& button.${P}--fieldIncrement`),
        [`& button.${P}--stepperIncrement, & button.${P}--stepperDecrement`]:
          button,
        // The divider keeps its hairline between the halves, however short the column.
        [`& .${P}--divider`]: { flexShrink: '0' },
        // InputBase's own box around the number takes no part in the field's layout: the input is
        // the layer, laid out by the field.
        [`& .${P}-number`]: { display: 'contents' },
      },
    }),
    // Hovered as the field is, and focused as the InputBase in it is; in error and disabled by the
    // props, as classes.
    states: {
      ...fieldStates('Number Input', ['error', 'disabled']),
      focus: `&:has(.${P}--field .Mui-focused)`,
    },
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // A field's label is its `label`, as Text Input's is.
  api: {
    react: { label: 'label' },
    // Flutter's word for a field that takes input (rule 5, owner decision 2026-09-25).
    flutter: { disabled: { not: 'enabled' } },
  },
};
