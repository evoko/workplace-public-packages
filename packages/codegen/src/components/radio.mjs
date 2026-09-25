/**
 * SOLAR Radio, beyond its IR: where MUI draws each layer and marks each state. Its shells are files
 * of their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * MUI's Radio on the web and Flutter's RawRadio, each checked by its group, the ring and dot drawn
 * inside by the shared layer helpers.
 */

import { drawnResets } from './shared/drawn.mjs';
import { targetInput } from './shared/target.mjs';

export default {
  name: 'Radio',
  mui: {
    // The shell draws every layer itself, inside MUI's root, each with a class of its own.
    slots: 'drawn',
    // MUI's root is the ring: its padding and round hover halo give way to the recipe's, and its
    // native input, invisible, covers the ring.
    resets: drawnResets('Radio', {
      padding: '0',
      // The input is the target, 44 × 44 around the ring (shared/target.mjs).
      ...targetInput('& input'),
    }),
    // A radio in a row that is its target (an Option Row's) takes the row's hover, as Checkbox's.
    states: {
      default: null,
      hover: '&:hover, .SolarStatesScope:hover &',
      focus: '&.Mui-focusVisible',
      disabled: '&.Mui-disabled',
    },
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // Its RadioGroup checks it, by its value, as it checks Flutter's own Radio.
  api: {
    flutter: { checked: { group: 'RadioGroup' } },
  },
};
