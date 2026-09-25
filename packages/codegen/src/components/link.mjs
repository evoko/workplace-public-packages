/**
 * SOLAR Link, beyond its IR: where MUI draws each layer and marks each state. Its shells are files
 * of their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * MUI's Link on the web, its label and icons drawn inside it by the shared layer helpers; drawn and
 * pressable in Flutter, announced as a link.
 */

import { drawnResets } from './shared/drawn.mjs';
import { targetArea } from './shared/target.mjs';

export default {
  name: 'Link',
  mui: {
    // The shell draws every layer itself, inside MUI's <a>, each with a class of its own.
    slots: 'drawn',
    // A caller's icon fills its slot, which the recipe sizes and colours; MUI's own outline on
    // keyboard focus gives way to SOLAR's ring.
    resets: drawnResets('Link', {
      '& .SolarLink-leadingIcon > svg, & .SolarLink-trailingIcon > svg': {
        display: 'block',
        width: '100%',
        height: '100%',
      },
      '&.Mui-focusVisible': { outline: 'none' },
      // A 44 × 44 target around the words (shared/target.mjs).
      ...targetArea(),
    }),
    states: {
      default: null,
      hover: '&:hover',
      pressed: '&:active',
      focus: '&.Mui-focusVisible',
      disabled: '&.SolarLink-disabled',
    },
    overlaps: { pressed: ['hover'], focus: ['hover', 'pressed'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // Flutter disables it as its own controls: by a null onPressed.
  api: {
    flutter: { disabled: 'onPressed' },
  },
};
