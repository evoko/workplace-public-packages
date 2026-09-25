/**
 * SOLAR Calendar Toolbar, beyond its IR: where MUI draws each layer. Its shells are files of their
 * own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * The toolbar over a calendar view, drawn from Figma's layers by the shared helpers
 * (`src/components/shared/drawn.mjs`): its own previous, next and Today buttons, the range it
 * shows, and the caller's view switcher and action.
 */

import { drawnResets } from './shared/drawn.mjs';

export default {
  name: 'Calendar Toolbar',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    resets: drawnResets('Calendar Toolbar', {}),
  },
  flutter: {},
};
