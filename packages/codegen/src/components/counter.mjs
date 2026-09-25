/**
 * SOLAR Counter, beyond its IR: where MUI draws each layer and marks each state. Its shells are
 * files of their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A drawn component (`src/components/shared/drawn.mjs`). Figma gives it hover and pressed because it is
 * drawn inside a Button: it takes the states of the control around it, and is a control of its own
 * only when given something to do (`onClick`, `onPressed`).
 */

import { drawnResets } from './shared/drawn.mjs';
import { targetArea } from './shared/target.mjs';

/**
 * A control the counter is, or sits in: a button that is not disabled. The one it sits in is
 * spelled from the element, since Emotion reads a selector that starts with a colon as the
 * counter's own (`:hover &` would be the counter hovered inside itself).
 */
const own = ':is(button):not(:disabled)';
// Not a tab: a Tab Item's Counter is drawn at rest in every state of the tab (its type says the
// tab's state), as Figma draws it.
const around = 'button:not(:disabled):not([role="tab"])';

export default {
  name: 'Counter',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // A counter given onClick is a <button>, which the browser styles as one.
    resets: drawnResets('Counter', {
      '&:is(button)': {
        font: 'inherit',
        margin: '0',
        cursor: 'pointer',
        appearance: 'none',
      },
      '&:is(button):disabled': { cursor: 'default' },
      // A 44 × 44 target around a counter that is a control (shared/target.mjs).
      ...targetArea('&:is(button)'),
    }),
    // Its own states where it is a control, and otherwise the states of the control it sits in
    // (a Button's), as Figma draws it inside one. Disabled is its prop's class, or a disabled
    // control around it.
    states: {
      default: null,
      hover: `&${own}:hover, ${around}:hover &`,
      pressed: `&${own}:active, ${around}:active &`,
      disabled:
        '&.SolarCounter-disabled, button:not([role="tab"]):disabled &, .Mui-disabled:not([role="tab"]) &',
    },
    overlaps: { pressed: ['hover'] },
  },
  flutter: {},
};
