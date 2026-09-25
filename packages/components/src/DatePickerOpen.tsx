/**
 * SOLAR Date Picker Open.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarDatePickerOpenTree` and `solarDatePickerOpenSlots` beside the recipe. What it looks like is
 * not here. That is the recipe, `solarDatePickerOpenStyle` and `solarDatePickerOpenCompose` in
 * `@bwp-web/styles/mui`: the calendar's surface, floating or inline, its header's and weekdays'
 * text styles, and the grid's gaps.
 *
 * The calendar a DatePicker opens, or the page holds `inline`: the month, its previous and next,
 * its weekdays from the locale's first (`weekStartsOn` overrides it), and a grid of
 * DatePickerDayCells, as many weeks as the month spans, the days of the months either side
 * disabled. `type="double"` shows the next month beside it, in the page (`inline`), as Figma draws
 * it; a floating one shows one month. The arrow keys move the focus a day or
 * a week, Home and End to the week's ends, Page Up and Down a month (with Shift, a year), and
 * Enter or a click chooses. `value` and `onChange` hold the date, an ISO string (`2026-04-24`),
 * with no time zone; `isDateDisabled`, `min` and `max` refuse dates. Given `anchorEl`, it floats
 * under it while `open`, a dialog, closed by Escape or a click outside. The app must load
 * `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { IconArrowLeft, IconArrowRight } from '@bwp-web/assets';
import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
} from 'react';
import {
  solarDatePickerOpenCompose,
  solarDatePickerOpenStyle,
  type SolarDatePickerOpenProps,
  solarDatePickerOpenSlots,
  solarDatePickerOpenTree,
} from '@bwp-web/styles/mui';
import {
  DatePickerDayCell,
  type DatePickerDayCellProps,
} from './DatePickerDayCell.js';
import {
  addDays,
  addMonths,
  dateOf,
  dayOf,
  firstWeekday,
  fullDate,
  isoOf,
  monthName,
  parseIso,
  weekdayNames,
  weeksOf,
  type Day,
} from './internal/calendar.js';
import { Float, type Floating } from './internal/float.js';
import { drawChildren } from './internal/layers.js';

export interface DatePickerOpenProps
  extends
    SolarDatePickerOpenProps,
    Omit<Floating, 'keepFocus' | 'popperProps'>,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<
      BoxProps,
      | keyof SolarDatePickerOpenProps
      | keyof Floating
      | 'value'
      | 'defaultValue'
      | 'onChange'
      | 'ref'
    > {
  /** The date chosen, ISO (`2026-04-24`), where the caller keeps it; null for none. */
  value?: string | null;
  /** The date it starts with, where `value` does not say. */
  defaultValue?: string | null;
  /** Called with the date chosen, ISO. */
  onChange?: (value: string) => void;
  /** The month it opens on, any day of it (ISO); the chosen date's, or today's, by default. */
  defaultMonth?: string;
  /** The earliest and latest dates it takes, ISO. */
  min?: string;
  max?: string;
  /** Whether a date is refused, ISO (a weekend, a booked day). */
  isDateDisabled?: (date: string) => boolean;
  /** The week's first day, 0 for Sunday to 6 for Saturday; the locale's by default. */
  weekStartsOn?: number;
  /** The locale its months and weekdays are written in; the page's by default. */
  locale?: string;
  /** Today, ISO, which it marks; the platform's by default. */
  today?: string;
  /** Moves the focus to its day (the chosen one, or the month's) as it first draws: a field's. */
  autoFocus?: boolean;
  /** The arrows' names, for a screen reader. */
  previousMonthLabel?: string;
  nextMonthLabel?: string;
  /**
   * More of a day's props, over those the calendar gives it, by its date and its grid's month (ISO,
   * `2026-04`): a test id, a tooltip's.
   */
  dayProps?: (
    date: string,
    month: string,
  ) => Partial<DatePickerDayCellProps> | undefined;
}

export const DatePickerOpen = forwardRef<HTMLDivElement, DatePickerOpenProps>(
  function DatePickerOpen(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarDatePickerOpen), under the caller's own.
    const {
      inline,
      type,
      value: valueProp,
      defaultValue = null,
      onChange,
      defaultMonth,
      min,
      max,
      isDateDisabled,
      weekStartsOn: weekStartsOnProp,
      locale,
      today: todayProp,
      previousMonthLabel = 'Previous month',
      nextMonthLabel = 'Next month',
      autoFocus = false,
      dayProps,
      anchorEl,
      anchorPosition,
      open,
      onClose,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarDatePickerOpen');
    const [own, setOwn] = useState<string | null>(defaultValue);
    const value = valueProp !== undefined ? valueProp : own;
    const chosen = parseIso(value);
    const today = parseIso(todayProp) ?? dayOf(new Date());
    const weekStartsOn = weekStartsOnProp ?? firstWeekday(locale);
    const opening = parseIso(defaultMonth) ?? chosen ?? today;
    const inOpening = (d: Day | null): d is Day =>
      d !== null && d.year === opening.year && d.month === opening.month;
    // The first month shown, and the day the grid's focus is on, which the keyboard moves: the
    // chosen day, where it is in the month it opens on, or today, or the month's first.
    const [view, setView] = useState<Day>({ ...opening, day: 1 });
    const [focus, setFocus] = useState<Day>(
      inOpening(chosen)
        ? chosen
        : inOpening(today)
          ? today
          : { ...opening, day: 1 },
    );
    const [moved, setMoved] = useState(autoFocus);
    const look = { inline, type };
    const parts = solarDatePickerOpenCompose(look);
    // Two months where the recipe draws the second: Figma draws a double calendar in the page, so
    // a floating one draws one month, and its keyboard keeps to it.
    const months = parts.container2DayGrid?.present === false ? 1 : 2;
    const shown = (offset: number) => addMonths(view, offset);
    const monthsFrom = (d: Day) =>
      (d.year - view.year) * 12 + d.month - view.month;
    const weekdays = weekdayNames(weekStartsOn, locale);
    const cells = useRef(new Map<string, HTMLDivElement>());
    useEffect(() => {
      if (moved) cells.current.get(isoOf(dateOf(focus)))?.focus();
    }, [focus, moved]);

    const refused = (d: Day) => {
      const iso = isoOf(dateOf(d));
      return (
        (min !== undefined && iso < min) ||
        (max !== undefined && iso > max) ||
        Boolean(isDateDisabled?.(iso))
      );
    };
    const choose = (d: Day) => {
      const iso = isoOf(dateOf(d));
      setOwn(iso);
      onChange?.(iso);
    };
    // A focus moved past the months shown turns them, so it stays in sight.
    const move = (to: Day) => {
      const past = monthsFrom(to);
      if (past < 0 || past >= months)
        setView(addMonths({ ...to, day: 1 }, past < 0 ? 0 : 1 - months));
      setFocus(to);
      setMoved(true);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const week = (dateOf(focus).getDay() - weekStartsOn + 7) % 7;
      const to: Record<string, () => Day> = {
        ArrowLeft: () => addDays(focus, -1),
        ArrowRight: () => addDays(focus, 1),
        ArrowUp: () => addDays(focus, -7),
        ArrowDown: () => addDays(focus, 7),
        Home: () => addDays(focus, -week),
        End: () => addDays(focus, 6 - week),
        PageUp: () => addMonths(focus, event.shiftKey ? -12 : -1),
        PageDown: () => addMonths(focus, event.shiftKey ? 12 : 1),
      };
      if (to[event.key]) {
        event.preventDefault();
        move(to[event.key]());
      } else if (
        (event.key === 'Enter' || event.key === ' ') &&
        !refused(focus)
      ) {
        event.preventDefault();
        choose(focus);
      }
    };

    /** One month's grid: its weeks, each a row, the days outside it disabled. */
    const grid = (offset: number) => {
      const month = shown(offset);
      return weeksOf(month.year, month.month, weekStartsOn).map((days, w) => (
        <div role="row" key={w} style={{ display: 'contents' }}>
          {days.map((d) => {
            const iso = isoOf(dateOf(d));
            const outside = d.month !== month.month;
            const off = outside || refused(d);
            return (
              <DatePickerDayCell
                key={iso}
                // The focus goes to a day in its own month's grid, not a neighbour's copy of it.
                ref={
                  outside
                    ? undefined
                    : (el) => {
                        if (el) cells.current.set(iso, el);
                        else cells.current.delete(iso);
                      }
                }
                aria-label={fullDate(d, locale)}
                tabIndex={!outside && iso === isoOf(dateOf(focus)) ? 0 : -1}
                selected={chosen !== null && iso === isoOf(dateOf(chosen))}
                today={iso === isoOf(dateOf(today))}
                disabled={off}
                onClick={() => {
                  setFocus(d);
                  choose(d);
                }}
                {...dayProps?.(iso, isoOf(dateOf(month)).slice(0, 7))}
              >
                {d.day}
              </DatePickerDayCell>
            );
          })}
        </div>
      ));
    };

    // An arrow turns the months shown, and the focus with them.
    const arrow = (step: number, label: string, icon: ReactElement) =>
      function arrowButton({
        className,
        style,
      }: {
        className: string;
        style?: CSSProperties;
      }) {
        return (
          <button
            type="button"
            className={`${className} SolarDatePickerOpen-arrow`}
            style={style}
            aria-label={label}
            onClick={() => {
              setView((v) => addMonths(v, step));
              setFocus((f) => addMonths(f, step));
            }}
          >
            {icon}
          </button>
        );
      };
    const calendar = (
      <Box
        ref={ref}
        role={
          anchorEl !== undefined || anchorPosition !== undefined
            ? 'dialog'
            : undefined
        }
        {...rest}
        sx={[
          solarDatePickerOpenStyle(look),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {drawChildren('root', {
          prefix: 'SolarDatePickerOpen',
          tree: solarDatePickerOpenTree,
          slots: solarDatePickerOpenSlots,
          parts,
          text: {
            month: monthName(shown(0).year, shown(0).month, locale),
            containerMonthHeaderMonthLabel: monthName(
              shown(0).year,
              shown(0).month,
              locale,
            ),
            container2MonthHeaderMonthLabel: monthName(
              shown(1).year,
              shown(1).month,
              locale,
            ),
          },
          // A week's days, Figma's seven copies of one text: the locale's names.
          repeat: {
            weekdayRowWeekday: weekdays,
            containerWeekdayRowWeekday: weekdays,
            container2WeekdayRowWeekday: weekdays,
          },
          content: {
            dayGrid: grid(0),
            containerDayGrid: grid(0),
            container2DayGrid: grid(1),
          },
          render: {
            dayGrid: ({ className, style, children }) => (
              // The days hold the grid's one stop for Tab (a roving tabIndex); the grid hears their keys.
              <div
                className={className}
                style={style}
                role="grid"
                tabIndex={-1}
                onKeyDown={onKeyDown}
              >
                {children}
              </div>
            ),
            weekdayRow: ({ className, style, children }) => (
              <div className={className} style={style} aria-hidden>
                {children}
              </div>
            ),
            containerDayGrid: ({ className, style, children }) => (
              // The days hold the grid's one stop for Tab (a roving tabIndex); the grid hears their keys.
              <div
                className={className}
                style={style}
                role="grid"
                tabIndex={-1}
                onKeyDown={onKeyDown}
              >
                {children}
              </div>
            ),
            containerWeekdayRow: ({ className, style, children }) => (
              <div className={className} style={style} aria-hidden>
                {children}
              </div>
            ),
            container2DayGrid: ({ className, style, children }) => (
              // The days hold the grid's one stop for Tab (a roving tabIndex); the grid hears their keys.
              <div
                className={className}
                style={style}
                role="grid"
                tabIndex={-1}
                onKeyDown={onKeyDown}
              >
                {children}
              </div>
            ),
            container2WeekdayRow: ({ className, style, children }) => (
              <div className={className} style={style} aria-hidden>
                {children}
              </div>
            ),
            monthHeaderIconArrowLeft: arrow(
              -1,
              previousMonthLabel,
              <IconArrowLeft />,
            ),
            monthHeaderIconArrowRight: arrow(
              1,
              nextMonthLabel,
              <IconArrowRight />,
            ),
            containerMonthHeaderIconArrowLeft: arrow(
              -1,
              previousMonthLabel,
              <IconArrowLeft />,
            ),
            container2MonthHeaderIconArrowRight: arrow(
              1,
              nextMonthLabel,
              <IconArrowRight />,
            ),
          },
        })}
      </Box>
    );
    return (
      <Float
        anchorEl={anchorEl}
        anchorPosition={anchorPosition}
        open={open}
        onClose={onClose}
      >
        {calendar}
      </Float>
    );
  },
);
