/**
 * SOLAR TimePicker Dropdown, beyond its IR: where MUI draws each layer. Its shells are files of
 * their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A menu's surface (`src/components/shared/menu.mjs`) whose rows are its own: the times of the day a step
 * apart, as Dropdown Items, the chosen one selected and in sight (owner decision 2026-09-24: one
 * list of times). Floats where it is anchored, as a Dropdown Menu does.
 */

import { drawnResets } from './shared/drawn.mjs';
import { menuResets } from './shared/menu.mjs';

export default {
  name: 'TimePicker Dropdown',
  mui: {
    // The shell draws every layer itself, each with a class of its own; its content is the list.
    slots: 'drawn',
    resets: drawnResets('TimePicker Dropdown', {
      flexDirection: 'column',
      ...menuResets('TimePicker Dropdown'),
    }),
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // Its rows are its times, which the shell builds.
  api: {
    react: { content: null },
    flutter: { content: null },
  },
};
