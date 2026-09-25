/**
 * SOLAR Agenda Row, beyond its IR: where MUI draws each layer and marks each state. Its shells are
 * files of their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * One event in an agenda list, drawn from Figma's layers by the shared helpers
 * (`src/components/shared/drawn.mjs`): its times, its dot in the event's colour, its title, its
 * words and an attendee's Avatar; hovered as a pointer reaches it, selected by the shell's class.
 */

import { drawnResets } from './shared/drawn.mjs';

const P = 'SolarAgendaRow';

export default {
  name: 'Agenda Row',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // Its title and words run out at the row's end, on one line each.
    resets: drawnResets('Agenda Row', {
      cursor: 'pointer',
      outline: 'none',
      [`& .${P}-title, & .${P}-meta`]: {
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
    }),
    // Hovered as a pointer reaches it; selected by the shell's class, over the hover.
    states: {
      default: null,
      hover: '&:hover',
      selected: `&.${P}-selected`,
    },
  },
  flutter: {},
};
