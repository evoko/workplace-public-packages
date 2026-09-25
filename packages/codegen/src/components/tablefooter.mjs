/**
 * SOLAR TableFooter, beyond its IR: where MUI draws each layer. Its shells are files of their own,
 * written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * The strip under a Table, drawn by the shared layer helpers (`src/components/shared/drawn.mjs`):
 * the caller's rows-per-page Dropdown and its words, Pagination and action, spread across it.
 */

import { drawnResets } from './shared/drawn.mjs';

export default {
  name: 'TableFooter',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // A strip that spans its table; the caller's controls keep their own size.
    resets: drawnResets('TableFooter', { display: 'flex' }),
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // Mobile draws the same Dropdown and Pagination in layers of its own.
  api: {
    react: {
      rowsPerPageMobile: 'rowsPerPage',
      paginationMobile: 'pagination',
    },
    flutter: {
      rowsPerPageMobile: 'rowsPerPage',
      paginationMobile: 'pagination',
    },
  },
};
