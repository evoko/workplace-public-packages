/**
 * SOLAR EmptyState, beyond its IR: where MUI draws each layer. Its shells are files of their own,
 * written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A drawn component (`src/components/shared/drawn.mjs`): a centred stack of the caller's icon, words and
 * Button.
 */

import { drawnResets } from './shared/drawn.mjs';

export default {
  name: 'EmptyState',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // The words wrap where they run out of room, centred in the stack Figma centres; the icon
    // fills its slot, which the recipe sizes and colours.
    resets: drawnResets('EmptyState', {
      '& .SolarEmptyState-title, & .SolarEmptyState-description': {
        whiteSpace: 'normal',
        textAlign: 'center',
      },
      '& .SolarEmptyState-icon > svg': {
        display: 'block',
        width: '100%',
        height: '100%',
      },
    }),
  },
  flutter: {},
};
