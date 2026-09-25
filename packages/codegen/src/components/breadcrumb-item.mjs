/**
 * SOLAR Breadcrumb Item, beyond its IR: where MUI draws each layer and marks each state. Its shells
 * are files of their own, written by hand. One file per component, so adding one edits nothing
 * shared; `src/components/index.mjs` finds them.
 *
 * A drawn component (`src/components/shared/drawn.mjs`): one segment of a Breadcrumbs trail, a link to an
 * ancestor, or the current page, which is no link. A focused link draws SOLAR's focus ring, which
 * Figma draws none of (as Nav Item's, owner decision 2026-09-24).
 */

import { drawnResets } from './shared/drawn.mjs';
import { targetArea } from './shared/target.mjs';

const P = 'SolarBreadcrumbItem';

export default {
  name: 'Breadcrumb Item',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // A link or a button, none of the browser's own look: no underline, no button face; a 44 × 44
    // target around one, which takes no room.
    resets: drawnResets('Breadcrumb Item', {
      display: 'flex',
      textDecoration: 'none',
      '&:is(button)': {
        appearance: 'none',
        font: 'inherit',
        margin: '0',
        padding: '0',
        border: '0',
        background: 'none',
        cursor: 'pointer',
      },
      outline: 'none',
      ...targetArea('&:is(a, button)'),
    }),
    // Hovered and focused as a link or a button is; disabled by the shell's class.
    states: {
      default: null,
      hover: '&:is(a, button):hover',
      focus: '&:is(a, button):focus-visible',
      disabled: `&.${P}-disabled`,
    },
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
};
