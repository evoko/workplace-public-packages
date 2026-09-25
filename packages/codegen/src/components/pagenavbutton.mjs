/**
 * SOLAR PageNavButton, beyond its IR: where MUI draws each layer and marks each state. Its shells
 * are files of their own, written by hand. One file per component, so adding one edits nothing
 * shared; `src/components/index.mjs` finds them.
 *
 * The previous or next button of a Page Navigator: MUI's ButtonBase on the web, drawn and pressable
 * in Flutter, its arrow and words drawn by the shared layer helpers.
 */

import { drawnResets } from './shared/drawn.mjs';
import { targetArea } from './shared/target.mjs';

const P = 'SolarPageNavButton';

export default {
  name: 'PageNavButton',
  mui: {
    // The shell draws every layer itself, inside MUI's ButtonBase, each with a class of its own.
    slots: 'drawn',
    // A 44 × 44 target around it, which takes no room; its arrows mirrored by the layout's
    // direction.
    resets: drawnResets('PageNavButton', {
      display: 'flex',
      borderStyle: 'solid',
      [`& .${P}--iconArrowLeft, & .${P}--iconArrowRight`]: { flexShrink: '0' },
      [`&:dir(rtl) .${P}--iconArrowLeft, &:dir(rtl) .${P}--iconArrowRight`]: {
        transform: 'scaleX(-1)',
      },
      ...targetArea(),
    }),
    states: {
      default: null,
      hover: '&:hover',
      pressed: '&:active',
      focus: '&.Mui-focusVisible',
      disabled: '&.Mui-disabled',
    },
    overlaps: { pressed: ['hover'], focus: ['hover'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // Flutter disables it as its own controls: by a null onPressed.
  api: {
    flutter: { disabled: 'onPressed' },
  },
};
