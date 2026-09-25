/**
 * SOLAR Breadcrumbs, beyond its IR: where MUI draws each layer. Its shells are files of their own,
 * written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A drawn trail: the caller's Breadcrumb Items, the last the current page, a chevron between each
 * two, each drawn in the layer Figma draws at its place (the first page `item1`, the next
 * `item2`…, the last `current`; the chevrons in order). Past five, the middle collapses to an
 * ellipsis that opens a Dropdown Menu of the pages it hides, as SOLAR's description says.
 */

import { drawnResets } from './shared/drawn.mjs';

const P = 'SolarBreadcrumbs';
const CHEVRONS = [
  'iconChevronRight',
  'iconChevronRight2',
  'iconChevronRight3',
  'iconChevronRight4',
];

export default {
  name: 'Breadcrumbs',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // The trail is an ordered list laid out as the root is, none of a list's own look; each item
    // and separator an entry of it; a chevron's size is the recipe's.
    resets: drawnResets('Breadcrumbs', {
      display: 'flex',
      [`& .${P}-list`]: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'inherit',
        alignItems: 'inherit',
        margin: '0',
        padding: '0',
        listStyle: 'none',
      },
      [`& .${P}-list > li`]: { display: 'flex' },
      [CHEVRONS.map((c) => `& .${P}-${c}`).join(', ')]: {
        display: 'block',
        flexShrink: '0',
      },
    }),
  },
  flutter: {},
};
