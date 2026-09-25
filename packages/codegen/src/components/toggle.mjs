/**
 * SOLAR Toggle, beyond its IR: where MUI draws each layer and marks each state. Its shells are
 * files of their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * MUI's Switch on the web, its root drawn as the track and the recipe's thumb in its thumb slot;
 * drawn and pressable in Flutter, announced as a switch.
 */

import { drawnResets } from './shared/drawn.mjs';
import { targetInput } from './shared/target.mjs';

export default {
  name: 'Toggle',
  mui: {
    // The shell draws every layer itself, inside MUI's root, each with a class of its own.
    slots: 'drawn',
    // MUI's root is the track, and its switch base, which holds the input and the thumb, covers
    // it: MUI's own track, padding, halo and the slide of its thumb give way to the recipe's.
    resets: drawnResets('Toggle', {
      padding: '0',
      overflow: 'visible',
      '& .MuiSwitch-track': { display: 'none' },
      '& .MuiSwitch-switchBase, & .MuiSwitch-switchBase.Mui-checked': {
        position: 'absolute',
        inset: '0',
        padding: '0',
        transform: 'none',
        backgroundColor: 'transparent',
      },
      // The input is the target, 44 × 44 around the track (shared/target.mjs).
      // Through the switch base, as specific as MUI's own rule for the input, which it follows.
      ...targetInput('& .MuiSwitch-switchBase .MuiSwitch-input'),
    }),
    // A toggle in a row that is its target (an Option Row's) takes the row's hover, as Checkbox's.
    states: {
      default: null,
      hover: '&:hover, .SolarStatesScope:hover &',
      focus: '&:has(.Mui-focusVisible)',
      disabled: '&.SolarToggle-disabled',
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
