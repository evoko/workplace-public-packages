/**
 * SOLAR Agenda Row.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarAgendaRowTree` and `solarAgendaRowSlots` beside the recipe. What it looks like is not here.
 * That is the recipe, `solarAgendaRowStyle` and `solarAgendaRowCompose` in `@bwp-web/styles/mui`:
 * the row, its edge, its words' text styles and its dot, by state and density.
 *
 * One event in the Agenda view, as the description says, a denser alternative to a Calendar Day
 * Cell, drawn from Figma's layer tree (`internal/layers.tsx`). At the comfortable `density`: its
 * `start` above its `end`, a dot in the event's `category` (an Event Chip's), its `title`, a line of words about it
 * (`meta`) and an `attendee` (a SOLAR Avatar). At compact: one time `range` ("9:00 – 10:00",
 * `start` and `end` joined where none is given) and its title. Given `onClick`, it is a button,
 * hovered under a pointer and `selected` as the one the caller shows. It fills its list. A styled
 * part: the event, its words and what a click does are the caller's. The app must load
 * `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef, type ReactNode } from 'react';
import {
  solarAgendaRowCompose,
  solarAgendaRowStyle,
  type SolarAgendaRowProps,
  solarAgendaRowSlots,
  solarAgendaRowTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

export interface AgendaRowProps
  extends
    SolarAgendaRowProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarAgendaRowProps | 'children' | 'title' | 'ref'> {
  /** The event's title. */
  title: ReactNode;
  /** When it starts ("9:00"). */
  start?: ReactNode;
  /** When it ends ("10:00"). */
  end?: ReactNode;
  /** The compact row's one time range; `start` and `end` joined where none is given. */
  range?: ReactNode;
  /** A line of words about it ("Conference room A · 6 attendees"). */
  meta?: ReactNode;
  /** An attendee: a SOLAR Avatar (md). */
  attendee?: ReactNode;
}

const P = 'SolarAgendaRow';

export const AgendaRow = forwardRef<HTMLDivElement, AgendaRowProps>(
  function AgendaRow(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarAgendaRow), under the caller's own.
    const {
      selected,
      density,
      category,
      title,
      start,
      end,
      range,
      meta,
      attendee,
      onClick,
      className,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarAgendaRow');
    const look = { selected, density, category };
    const composed = solarAgendaRowCompose(look);
    const joined =
      range ??
      (typeof start === 'string' && typeof end === 'string'
        ? `${start} – ${end}`
        : start);
    // A part left out is not drawn.
    const parts = {
      ...composed,
      start: {
        ...composed.start,
        present: composed.start.present && start != null,
      },
      end: { ...composed.end, present: composed.end.present && end != null },
      range: {
        ...composed.range,
        present: composed.range.present && joined != null,
      },
      meta: {
        ...composed.meta,
        present: composed.meta.present && meta != null,
      },
      attendee: {
        ...composed.attendee,
        present: composed.attendee.present && attendee != null,
      },
    };
    const held = (node: ReactNode) =>
      function Held({
        className: cls,
        style,
      }: {
        className: string;
        style?: object;
      }) {
        return (
          <span className={cls} style={style}>
            {node}
          </span>
        );
      };
    const pressable = onClick != null;
    return (
      <Box
        ref={ref}
        role={pressable ? 'button' : undefined}
        tabIndex={pressable ? 0 : undefined}
        aria-pressed={pressable ? (selected ?? false) : undefined}
        onClick={onClick}
        {...rest}
        className={
          [selected ? `${P}-selected` : null, className]
            .filter(Boolean)
            .join(' ') || undefined
        }
        sx={[solarAgendaRowStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: P,
          tree: solarAgendaRowTree,
          slots: solarAgendaRowSlots,
          parts,
          text: { title, start, end, range: joined, meta },
          render: { attendee: held(attendee) },
        })}
      </Box>
    );
  },
);
