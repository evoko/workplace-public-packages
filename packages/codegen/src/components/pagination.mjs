/**
 * SOLAR Pagination, beyond its IR: where MUI draws each layer. Its shells are files of their own,
 * written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A drawn assembly: the previous arrow, the pages and their gaps, the next arrow, each drawn in the
 * layer Figma draws at its place (the first page `page1`, then `page2` and `page3`, the last
 * `page12`, a gap `paginationEllipsis`). The pages shown are Figma's (owner decision 2026-09-24).
 */

import { drawnResets } from './shared/drawn.mjs';

const P = 'SolarPagination';

export default {
  name: 'Pagination',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // The pages are a list laid out as the root is, none of a list's own look.
    resets: drawnResets('Pagination', {
      display: 'flex',
      [`& .${P}-list`]: {
        display: 'flex',
        gap: 'inherit',
        alignItems: 'inherit',
        margin: '0',
        padding: '0',
        listStyle: 'none',
      },
      [`& .${P}-list > li`]: { display: 'flex' },
    }),
  },
  flutter: {},
};
