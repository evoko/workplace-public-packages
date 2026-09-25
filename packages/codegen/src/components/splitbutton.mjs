/**
 * SOLAR SplitButton, beyond its IR: where MUI draws each layer and marks each state. Its shells are
 * files of their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A drawn component with two press targets: the shells draw Figma's layer tree with the shared
 * helpers, the action and the chevron halves as buttons of their own, and the whole control takes
 * the states of whichever half is hovered, pressed or focused, as Figma draws them.
 */

import { drawnResets } from './shared/drawn.mjs';
import { targetArea } from './shared/target.mjs';

export default {
  name: 'SplitButton',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // The halves are buttons with no look of their own (MUI's ButtonBase); the loading Spinner sits
    // in the middle of the control, over the halves, which keep their room.
    resets: drawnResets('SplitButton', {
      '& .SolarSplitButton--action, & .SolarSplitButton--trigger': {
        font: 'inherit',
        color: 'inherit',
      },
      // A 44 × 44 target around each half (shared/target.mjs).
      ...targetArea('& .SolarSplitButton--action'),
      ...targetArea('& .SolarSplitButton--trigger'),
      '& .SolarSplitButton--spinner': {
        position: 'absolute',
        inset: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    }),
    // The whole control's states, from either half: the pointer over it or pressing it, a half
    // focused by keyboard (MUI's focus-visible class on it), or the props' classes the shell sets.
    states: {
      default: null,
      hover: '&:hover',
      pressed: '&:active',
      focus: '&:has(.Mui-focusVisible)',
      loading: '&.SolarSplitButton-loading',
      disabled: '&.SolarSplitButton-disabled',
    },
    overlaps: { pressed: ['hover'], focus: ['hover', 'pressed'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // Flutter disables it as its own buttons: by a null onPressed.
  api: {
    flutter: { disabled: 'onPressed' },
  },
};
