/**
 * SOLAR Tooltip, beyond its IR: where MUI draws each layer. Its shells are files of their own,
 * written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A brief label over its trigger: the bubble and its arrow drawn from Figma's layers by the shared
 * helpers (`src/components/shared/drawn.mjs`), as MUI Tooltip's title; the bubble alone, in place,
 * where it has no trigger.
 */

import { drawnResets } from './shared/drawn.mjs';

export default {
  name: 'Tooltip',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // The bubble hugs its words, which wrap past the description's line; nothing it holds takes
    // the pointer, as a tooltip never does.
    resets: drawnResets('Tooltip', {
      pointerEvents: 'none',
      '& .SolarTooltip-content': { whiteSpace: 'normal' },
    }),
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // Its words are MUI's title and Flutter's message, each platform's own word for them.
  api: {
    react: { content: 'title' },
    flutter: { content: 'message' },
  },
};
