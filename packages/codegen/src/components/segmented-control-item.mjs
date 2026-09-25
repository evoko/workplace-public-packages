/**
 * SOLAR Segmented Control Item, beyond its IR: where MUI draws each layer and marks each state. Its
 * shells are files of their own, written by hand. One file per component, so adding one edits
 * nothing shared; `src/components/index.mjs` finds them.
 *
 * One choice of a Segmented Control, which is a radio group: on the web a label around a native
 * radio input, in Flutter a RawRadio; its words and icons drawn by the shared layer helpers.
 */

import { drawnResets } from './shared/drawn.mjs';
import { targetArea } from './shared/target.mjs';

const P = 'SolarSegmentedControlItem';

export default {
  name: 'Segmented Control Item',
  mui: {
    // The shell draws every layer itself, inside its <label>, each with a class of its own.
    slots: 'drawn',
    // Its radio input is the browser's, and invisible: the segment is what shows. A caller's icon
    // fills its slot, which the recipe sizes and colours.
    resets: drawnResets('Segmented Control Item', {
      cursor: 'pointer',
      // A 44 × 44 target around the segment (shared/target.mjs).
      ...targetArea(),
      [`& .${P}-input`]: {
        position: 'absolute',
        opacity: '0',
        width: '1px',
        height: '1px',
        margin: '0',
        pointerEvents: 'none',
      },
      [`& .${P}-iconLeading > svg, & .${P}-iconTrailing > svg`]: {
        display: 'block',
        width: '100%',
        height: '100%',
      },
    }),
    states: {
      default: null,
      hover: '&:hover',
      focus: `&:has(.${P}-input:focus-visible)`,
    },
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // Its RadioGroup selects it, by its value, as it checks a SolarRadio.
  api: {
    flutter: { selected: { group: 'RadioGroup' } },
  },
};
