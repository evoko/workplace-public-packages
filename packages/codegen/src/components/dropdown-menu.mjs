/**
 * SOLAR Dropdown Menu, beyond its IR: where MUI draws each layer. Its shells are files of their
 * own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A drawn surface (`src/components/shared/drawn.mjs`) whose content layer holds the caller's rows and headings
 * in place of Figma's examples: MUI's MenuList on the web, `SolarMenuList` in Flutter. It floats
 * where it is anchored (`internal/float.tsx`, `SolarMenuAnchor`), and draws in place otherwise
 * (owner decision 2026-09-24).
 */

import { drawnResets } from './shared/drawn.mjs';
import { menuResets } from './shared/menu.mjs';

export default {
  name: 'Dropdown Menu',
  mui: {
    // The shell draws every layer itself, each with a class of its own; its content is the list.
    slots: 'drawn',
    resets: drawnResets('Dropdown Menu', {
      flexDirection: 'column',
      ...menuResets('Dropdown Menu'),
    }),
  },
  flutter: {},
};
