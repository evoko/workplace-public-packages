/**
 * SOLAR Banner, beyond its IR: where MUI draws each layer. Its shells are files of their own,
 * written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A drawn component (`src/components/shared/drawn.mjs`): a full-width strip whose icon is SOLAR's for its
 * type, holding the caller's Buttons, a text action and a close button.
 */

import { drawnResets } from './shared/drawn.mjs';
import { targetArea } from './shared/target.mjs';

export default {
  name: 'Banner',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // One line, cut short where it runs out of room ("single line with truncation"); the text
    // action and the close button are bare <button>s, the icon filling the latter.
    resets: drawnResets('Banner', {
      '& .SolarBanner-description': {
        minWidth: '0',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
      '& button.SolarBanner-action, & button.SolarBanner-close': {
        appearance: 'none',
        border: '0',
        padding: '0',
        margin: '0',
        background: 'none',
        cursor: 'pointer',
      },
      // A 44 × 44 target around the text action and the close button ("implement each with a
      // ≥44×44px touch area", says the description; shared/target.mjs).
      ...targetArea('& button.SolarBanner-action'),
      ...targetArea('& button.SolarBanner-close'),
      '& .SolarBanner-close > svg': {
        display: 'block',
        width: '100%',
        height: '100%',
      },
    }),
  },
  flutter: {},
};
