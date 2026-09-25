/**
 * SOLAR Calendar Toolbar.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarCalendarToolbarTree` and `solarCalendarToolbarSlots` beside the recipe. What it looks like
 * is not here. That is the recipe, `solarCalendarToolbarStyle` and `solarCalendarToolbarCompose` in
 * `@bwp-web/styles/mui`: the bar, its groups, its range's text style, and which Button and Icon
 * Button each of its own controls is.
 *
 * The toolbar over a calendar view, as the description says, drawn from Figma's layer tree
 * (`internal/layers.tsx`). On the left its own previous and next Icon Buttons and Today Button,
 * which call `onPrevious`, `onNext` and `onToday` (named by `previousLabel`, `nextLabel` and
 * `todayLabel`), and the `range` the view shows ("October 5 – 11, 2026"). On the right the caller's
 * view switcher (`views`, a SOLAR Segmented Control: Day, Week, Month, Agenda) and `action` (a
 * SOLAR Button, a new event). It is a toolbar, and spans its view. What each control does is the
 * caller's. The app must load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef, type ReactNode } from 'react';
import {
  solarCalendarToolbarCompose,
  solarCalendarToolbarStyle,
  solarCalendarToolbarSlots,
  solarCalendarToolbarTree,
} from '@bwp-web/styles/mui';
import { IconChevronLeft, IconChevronRight } from '@bwp-web/assets';
import { Button, type ButtonProps } from './Button.js';
import { IconButton, type IconButtonProps } from './IconButton.js';
import { drawChildren } from './internal/layers.js';

export interface CalendarToolbarProps extends Omit<
  BoxProps,
  'children' | 'ref'
> {
  /** The range the view shows, in the caller's words ("October 5 – 11, 2026"). */
  range: ReactNode;
  /** The view switcher: a SOLAR Segmented Control (sm). */
  views?: ReactNode;
  /** The action on the right: a SOLAR Button (sm), a new event. */
  action?: ReactNode;
  /** Called by the previous button: the range before. */
  onPrevious?: () => void;
  /** Called by the next button: the range after. */
  onNext?: () => void;
  /** Called by the Today button: the range with today in it. */
  onToday?: () => void;
  /** What the previous button says to a screen reader. */
  previousLabel?: string;
  /** What the next button says to a screen reader. */
  nextLabel?: string;
  /** The Today button's words. */
  todayLabel?: ReactNode;
}

const P = 'SolarCalendarToolbar';

export const CalendarToolbar = forwardRef<HTMLDivElement, CalendarToolbarProps>(
  function CalendarToolbar(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarCalendarToolbar), under the caller's own.
    const {
      range,
      views,
      action,
      onPrevious,
      onNext,
      onToday,
      previousLabel = 'Previous',
      nextLabel = 'Next',
      todayLabel = 'Today',
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarCalendarToolbar');
    const composed = solarCalendarToolbarCompose({});
    // A slot left empty is not drawn.
    const parts: typeof composed = {
      ...composed,
      views: {
        ...composed.views,
        present: composed.views.present && views != null,
      },
      action: {
        ...composed.action,
        present: composed.action.present && action != null,
      },
    };
    // Each of its own controls is the Button or Icon Button the recipe names for its layer.
    const iconButton = (layer: 'prev' | 'next') => {
      const p = parts[layer] as Record<string, unknown>;
      return {
        size: p['variant.size'] as IconButtonProps['size'],
        shape: p['variant.shape'] as IconButtonProps['shape'],
        prio: p['variant.prio'] as IconButtonProps['prio'],
      };
    };
    const today = parts.todayButton as Record<string, unknown>;
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
    return (
      <Box
        ref={ref}
        role="toolbar"
        {...rest}
        sx={[solarCalendarToolbarStyle({}), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: P,
          tree: solarCalendarToolbarTree,
          slots: solarCalendarToolbarSlots,
          parts,
          text: { range },
          render: {
            prev: held(
              <IconButton
                {...iconButton('prev')}
                icon={<IconChevronLeft />}
                aria-label={previousLabel}
                onClick={onPrevious}
              />,
            ),
            next: held(
              <IconButton
                {...iconButton('next')}
                icon={<IconChevronRight />}
                aria-label={nextLabel}
                onClick={onNext}
              />,
            ),
            todayButton: held(
              <Button
                size={today['variant.size'] as ButtonProps['size']}
                prio={today['variant.prio'] as ButtonProps['prio']}
                onClick={onToday}
              >
                {todayLabel}
              </Button>,
            ),
            views: held(views),
            action: held(action),
          },
        })}
      </Box>
    );
  },
);
