/**
 * SOLAR Checkbox, beyond its IR: where MUI draws each layer and marks each state. Its shells are
 * files of their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * MUI's Checkbox on the web, its root the box, the tick and dash drawn inside it by the shared layer
 * helpers as MUI's icons; drawn and pressable in Flutter, announced as a checkbox.
 */

import { drawnResets } from './shared/drawn.mjs';
import { targetInput } from './shared/target.mjs';

export default {
  name: 'Checkbox',
  mui: {
    // The shell draws every layer itself, inside MUI's root, each with a class of its own.
    slots: 'drawn',
    // MUI's root is the box: its padding and round hover halo give way to the recipe's, and its
    // native input, invisible, covers the box.
    resets: drawnResets('Checkbox', {
      padding: '0',
      // The input is the target, 44 × 44 around the box (shared/target.mjs).
      ...targetInput('& input'),
    }),
    // A box a row draws for its choice (a Dropdown Item's) is inert, and takes the row's hover:
    // the row marks itself SolarStatesScope, as Flutter's scope shares a control's states, and
    // its keyboard focus draws its hover, as Figma's row draws the box hovered.
    states: {
      default: null,
      hover:
        '&:hover, .SolarStatesScope:hover &, .SolarStatesScope.Mui-focusVisible &',
      focus: '&.Mui-focusVisible',
      disabled: '&.Mui-disabled',
    },
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // Flutter disables it as its own controls: by a null onChanged.
  api: {
    flutter: { disabled: 'onChanged' },
  },
};
