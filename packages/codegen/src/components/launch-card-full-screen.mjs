/**
 * SOLAR Launch Card Full Screen, beyond its IR: where MUI draws each layer. Its shells are files of
 * their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A drawn page (`src/components/shared/drawn.mjs`), built with slots (owner decision 2026-09-25): an app's
 * image beside its App Icon and favourite, its name, an intro and up to three features, and its
 * action, the caller's Button.
 */

import { drawnResets } from './shared/drawn.mjs';

const P = 'SolarLaunchCardFullScreen';
const FEATURES = ['feature', 'feature2', 'feature3'];

export default {
  name: 'Launch Card Full Screen',
  mui: {
    // The shell draws every layer itself, each with a class of its own; its words wrap, and the
    // picture fills the image, cut to its corners.
    slots: 'drawn',
    resets: drawnResets('Launch Card Full Screen', {
      display: 'flex',
      [`& .${P}-name, & .${P}-intro, ${FEATURES.map((f) => `& .${P}-${f}`).join(', ')}`]:
        {
          whiteSpace: 'normal',
          minWidth: '0',
        },
      [`& .${P}--image`]: { overflow: 'hidden', flexShrink: '0' },
      [`& .${P}--image > img`]: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      },
      [`& .${P}-appIcon > img`]: {
        display: 'block',
        width: '100%',
        height: '100%',
      },
    }),
  },
  flutter: {},
};
