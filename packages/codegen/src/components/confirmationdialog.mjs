/**
 * SOLAR ConfirmationDialog, beyond its IR: where MUI draws each layer. Its shells are files of
 * their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A dialog for an action that needs approval: MUI's Dialog, its paper the surface drawn from
 * Figma's layers by the shared helpers (`src/components/shared/drawn.mjs`), its backdrop SOLAR's
 * Scrim; its title and description, and its own Buttons, to cancel and to confirm.
 */

import { drawnResets } from './shared/drawn.mjs';

const P = 'SolarConfirmationDialog';

export default {
  name: 'ConfirmationDialog',
  mui: {
    // The shell draws every layer itself, inside MUI's Dialog paper, each with a class of its own.
    slots: 'drawn',
    // A column of its parts, the surface the recipe's alone; its words wrap.
    resets: drawnResets('ConfirmationDialog', {
      display: 'flex',
      backgroundImage: 'none',
      maxWidth: 'calc(100% - 2 * var(--solar-inset-xl))',
      [`& .${P}-title, & .${P}-description`]: {
        whiteSpace: 'normal',
        minWidth: '0',
      },
    }),
  },
  flutter: {},
};
