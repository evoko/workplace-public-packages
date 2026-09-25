/**
 * SOLAR Stepper, beyond its IR: where MUI draws each layer. Its shells are files of their own,
 * written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A drawn progress indicator of two to five steps, in four types, each part drawn in the layer
 * Figma draws for its status (a completed step's segment in the layer of Figma's completed one), so
 * any active step draws right. It takes the steps' labels and the active one's index (owner
 * decision 2026-09-24); completed steps are buttons where it has `onStepClick` (owner decision
 * 2026-09-24).
 */

import { drawnResets } from './shared/drawn.mjs';

const P = 'SolarStepper';

export default {
  name: 'Stepper',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // A list, none of a list's own look; a step's name is read, not drawn, where its type draws
    // no words.
    resets: drawnResets('Stepper', {
      display: 'flex',
      margin: '0',
      padding: '0',
      listStyle: 'none',
      [`& .${P}--steps`]: { margin: '0', padding: '0', listStyle: 'none' },
      [`& li`]: { display: 'flex' },
      [`& .${P}-name`]: {
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        overflow: 'hidden',
        clipPath: 'inset(50%)',
        whiteSpace: 'nowrap',
      },
    }),
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // The steps are the caller's labels, which the shell draws; Figma's showStep booleans say how
  // many.
  api: {
    react: { step3: null, step4: null, step5: null },
    flutter: { step3: null, step4: null, step5: null },
  },
};
