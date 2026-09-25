/**
 * SOLAR PaginationEllipsis, beyond its IR: where MUI draws each layer. Its shells are files of
 * their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A drawn component (`src/components/shared/drawn.mjs`): the gap in a Pagination's pages, static text.
 */

import { drawnResets } from './shared/drawn.mjs';

export default {
  name: 'PaginationEllipsis',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    resets: drawnResets('PaginationEllipsis', { display: 'flex' }),
  },
  flutter: {},
};
