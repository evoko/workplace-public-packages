/**
 * SOLAR PageNavigator, beyond its IR: where MUI draws each layer. Its shells are files of their
 * own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A drawn pager: the previous and next PageNavButtons and, between them, where the reader is.
 */

import { drawnResets } from './shared/drawn.mjs';

export default {
  name: 'PageNavigator',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    resets: drawnResets('PageNavigator', { display: 'flex' }),
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // Where the reader is, written from the page and the count.
  api: {
    react: { pageIndicator: 'indicator' },
    flutter: { pageIndicator: 'indicator' },
  },
};
