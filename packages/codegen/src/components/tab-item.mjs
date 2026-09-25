/**
 * SOLAR Tab Item, beyond its IR: where MUI draws each layer and marks each state. Its shells are
 * files of their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * One tab of a Tabs strip: MUI's Tab on the web, drawn and pressable in Flutter, its icons, words
 * and Counter drawn by the shared layer helpers. The strip moves the focus with the arrow keys, and
 * Enter or Space selects (owner decision 2026-09-24); a focused tab draws Figma's focus, the
 * selected underline and the ring (owner decision 2026-09-24).
 */

import { drawnResets } from './shared/drawn.mjs';
import { targetArea } from './shared/target.mjs';

const P = 'SolarTabItem';

export default {
  name: 'Tab Item',
  mui: {
    // The shell draws every layer itself, inside MUI's Tab, each with a class of its own.
    slots: 'drawn',
    // Tab's own look gives way to the recipe's: its minimum size, its capitals, its stacked icon,
    // its faded disabled tab (the recipe draws Figma's). A caller's icon fills its slot, which the
    // recipe sizes and colours. A 44 × 44 target around it, which takes no room.
    resets: drawnResets('Tab Item', {
      display: 'flex',
      flexDirection: 'row',
      minHeight: '0',
      minWidth: '0',
      maxWidth: 'none',
      textTransform: 'none',
      opacity: '1',
      overflow: 'visible',
      boxSizing: 'border-box',
      borderStyle: 'solid',
      [`& .${P}-leadingIcon, & .${P}-trailingIcon, & .${P}-counter`]: {
        flexShrink: '0',
      },
      [`& .${P}-leadingIcon > svg, & .${P}-trailingIcon > svg`]: {
        display: 'block',
        width: '100%',
        height: '100%',
      },
      ...targetArea(),
    }),
    // Hovered as the pointer is; focused as the keyboard reaches it (MUI marks it focus-visible);
    // selected and disabled as MUI marks them.
    states: {
      default: null,
      hover: '&:hover',
      focus: '&.Mui-focusVisible',
      selected: '&.Mui-selected',
      disabled: '&.Mui-disabled',
    },
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // A tab's words are its `label`, as MUI's Tab names them.
  // The counter is a count, which the shell draws as a SOLAR Counter in the recipe's variant.
  api: {
    react: { label: 'label', counter: 'count' },
    flutter: { counter: 'count' },
  },
};
