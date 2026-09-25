/**
 * SOLAR Segmented Control, beyond its IR: where MUI draws each layer. Its shells are files of their
 * own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A drawn component: a field's label and helper around a track of the caller's segments (the
 * helpers' `content`), which is a radio group.
 */

import { drawnResets } from './shared/drawn.mjs';

export default {
  name: 'Segmented Control',
  mui: {
    // The shell draws every layer itself, each with a class of its own; the track holds the
    // caller's segments in place of Figma's examples.
    slots: 'drawn',
    resets: drawnResets('Segmented Control'),
  },
  flutter: {},
};
