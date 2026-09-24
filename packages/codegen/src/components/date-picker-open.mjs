/**
 * SOLAR Date Picker Open, beyond its IR: where MUI draws each layer, and the two shell templates,
 * rendered into the shells by \`solar:codegen\` on every run. One file per component, so adding one
 * edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A drawn calendar (`src/shells/drawn.mjs`): a month's header, its weekdays and a grid of Date
 * Picker Day Cells, as many weeks as the month spans, the arrow keys moving the focus in it, one
 * date chosen. Its dates are the platform's (`internal/calendar.ts`; DateTime and
 * MaterialLocalizations), not a picker library's.
 */

import {
  drawnResets,
  iconsOf,
  keyPrefixOf,
  treeOf,
  wrapDoc,
} from '../shells/drawn.mjs';
import { dartField, dartParam } from '../shells/helpers.mjs';
import { targetArea } from '../shells/target.mjs';

const P = 'SolarDatePickerOpen';

/** Each calendar the component draws: a single one, or a double's two, by their layers. */
const MONTHS = [
  {
    offset: 0,
    header: 'monthHeader',
    label: 'month',
    previous: 'monthHeaderIconArrowLeft',
    next: 'monthHeaderIconArrowRight',
    weekdays: 'weekdayRowWeekday',
    grid: 'dayGrid',
  },
  {
    offset: 0,
    header: 'containerMonthHeader',
    label: 'containerMonthHeaderMonthLabel',
    previous: 'containerMonthHeaderIconArrowLeft',
    weekdays: 'containerWeekdayRowWeekday',
    grid: 'containerDayGrid',
  },
  {
    offset: 1,
    header: 'container2MonthHeader',
    label: 'container2MonthHeaderMonthLabel',
    next: 'container2MonthHeaderIconArrowRight',
    weekdays: 'container2WeekdayRowWeekday',
    grid: 'container2DayGrid',
  },
];

/** A weekday row's seven layers: `weekdayRowWeekday`, `weekdayRowWeekday2`… */
const weekdayLayers = (prefix) =>
  Array.from({ length: 7 }, (_, i) => `${prefix}${i === 0 ? '' : i + 1}`);

const requireLayers = (spec) => {
  for (const m of MONTHS)
    for (const layer of [
      m.header,
      m.label,
      m.previous,
      m.next,
      m.grid,
      ...weekdayLayers(m.weekdays),
    ].filter(Boolean))
      if (!spec.layers[layer])
        throw new Error(`Date Picker Open: the IR has no ${layer} layer`);
};

export default {
  name: 'Date Picker Open',
  mui: {
    // The shell draws every layer itself, each with a class of its own; its grids hold its days.
    slots: 'drawn',
    // A block; each grid seven days wide, the weeks the month spans; the arrows are buttons with a
    // 44 × 44 target, none of the browser's own look.
    resets: drawnResets('Date Picker Open', {
      display: 'flex',
      [MONTHS.map((m) => `& .${P}-${m.grid}`).join(', ')]: {
        gridTemplateColumns: 'repeat(7, max-content)',
      },
      // The target's own rule on the button, merged: one rule per selector.
      ...targetArea(`& .${P}-arrow`),
      [`& .${P}-arrow`]: {
        ...targetArea(`& .${P}-arrow`)[`& .${P}-arrow`],
        appearance: 'none',
        border: '0',
        padding: '0',
        margin: '0',
        background: 'none',
        color: 'inherit',
        cursor: 'pointer',
        minWidth: '0',
        '& > svg': { display: 'block', width: '100%', height: '100%' },
      },
    }),
  },
  flutter: {},
  shells: {
    // The month is the one shown, which the shell writes itself.
    slots: { month: null },
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      const text = MONTHS.flatMap((m) => [
        `${m.label}: monthName(shown(${m.offset}).year, shown(${m.offset}).month, locale),`,
        ...weekdayLayers(m.weekdays).map((l, d) => `${l}: weekdays[${d}],`),
      ]);
      const icon = Object.fromEntries(
        iconsOf(spec).map((i) => [i.layer, i.react]),
      );
      const arrows = MONTHS.flatMap((m) => [
        m.previous ? [m.previous, -1, 'previousMonthLabel'] : null,
        m.next ? [m.next, 1, 'nextMonthLabel'] : null,
      ]).filter(Boolean);
      const react = [...new Set(arrows.map(([layer]) => icon[layer]))].sort();
      return `/**
 * SOLAR Date Picker Open.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarDatePickerOpenStyle\` and \`solarDatePickerOpenCompose\` in
 * \`@bwp-web/styles/mui\`: the calendar's surface, floating or inline, its header's and weekdays'
 * text styles, and the grid's gaps.
 *
 * The calendar a DatePicker opens, or the page holds \`inline\`: the month, its previous and next,
 * its weekdays from the locale's first (\`weekStartsOn\` overrides it), and a grid of
 * DatePickerDayCells, as many weeks as the month spans, the days of the months either side
 * disabled. \`type="double"\` shows the next month beside it, in the page (\`inline\`), as Figma draws
 * it; a floating one shows one month. The arrow keys move the focus a day or
 * a week, Home and End to the week's ends, Page Up and Down a month (with Shift, a year), and
 * Enter or a click chooses. \`value\` and \`onChange\` hold the date, an ISO string (\`2026-04-24\`),
 * with no time zone; \`isDateDisabled\`, \`min\` and \`max\` refuse dates. Given \`anchorEl\`, it floats
 * under it while \`open\`, a dialog, closed by Escape or a click outside. The app must load
 * \`@bwp-web/styles/tokens.css\`.
 */

import Box, { type BoxProps } from '@mui/material/Box';
import { ${react.join(', ')} } from '@bwp-web/assets';
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

/** Each layer's children, as Figma nests them. */
const TREE: Record<string, string[]> = ${JSON.stringify(treeOf(spec))};

export interface DatePickerOpenProps
  extends SolarDatePickerOpenProps,
    Omit<Floating, 'keepFocus' | 'popperProps'>,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarDatePickerOpenProps | keyof Floating | 'value' | 'defaultValue' | 'onChange' | 'ref'> {
  /** The date chosen, ISO (\`2026-04-24\`), where the caller keeps it; null for none. */
  value?: string | null;
  /** The date it starts with, where \`value\` does not say. */
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
   * \`2026-04\`): a test id, a tooltip's.
   */
  dayProps?: (
    date: string,
    month: string,
  ) => Partial<DatePickerDayCellProps> | undefined;
}

export const DatePickerOpen = forwardRef<HTMLDivElement, DatePickerOpenProps>(
  function DatePickerOpen(
    {
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
    },
    ref,
  ) {
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
      inOpening(chosen) ? chosen : inOpening(today) ? today : { ...opening, day: 1 },
    );
    const [moved, setMoved] = useState(autoFocus);
    const look = { inline, type };
    const parts = solarDatePickerOpenCompose(look);
    // Two months where the recipe draws the second: Figma draws a double calendar in the page, so
    // a floating one draws one month, and its keyboard keeps to it.
    const months = parts.${MONTHS[2].grid}?.present === false ? 1 : 2;
    const shown = (offset: number) => addMonths(view, offset);
    const monthsFrom = (d: Day) => (d.year - view.year) * 12 + d.month - view.month;
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
      } else if ((event.key === 'Enter' || event.key === ' ') && !refused(focus)) {
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
      function arrowButton({ className, style }: { className: string; style?: CSSProperties }) {
        return (
        <button
          type="button"
          className={\`\${className} ${P}-arrow\`}
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
        role={anchorEl !== undefined || anchorPosition !== undefined ? 'dialog' : undefined}
        {...rest}
        sx={[solarDatePickerOpenStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: '${P}',
          tree: TREE,
          parts,
          text: {
${text.map((l) => `            ${l}`).join('\n')}
          },
          content: {
${MONTHS.map((m) => `            ${m.grid}: grid(${m.offset}),`).join('\n')}
          },
          render: {
${MONTHS.map(
  (m) => `            ${m.grid}: ({ className, style, children }) => (
              // The days hold the grid's one stop for Tab (a roving tabIndex); the grid hears their keys.
              <div className={className} style={style} role="grid" tabIndex={-1} onKeyDown={onKeyDown}>
                {children}
              </div>
            ),
            ${weekdayLayers(m.weekdays)[0].replace(/Weekday$/, '')}: ({ className, style, children }) => (
              <div className={className} style={style} aria-hidden>
                {children}
              </div>
            ),`,
).join('\n')}
${arrows.map(([layer, step, label]) => `            ${layer}: arrow(${step}, ${label}, <${icon[layer]} />),`).join('\n')}
          },
        })}
      </Box>
    );
    return (
      <Float anchorEl={anchorEl} anchorPosition={anchorPosition} open={open} onClose={onClose}>
        {calendar}
      </Float>
    );
  },
);
`;
    },
    flutter: (spec) => {
      requireLayers(spec);
      const tree = Object.entries(treeOf(spec))
        .map(
          ([parent, kids]) =>
            `    '${parent}': [${kids.map((k) => `'${k}'`).join(', ')}],`,
        )
        .join('\n');
      const api = Object.entries(spec.api);
      const header = `Generated from its template in \`packages/codegen/src/components/\` on every \`npm run solar:codegen\`: change the template there, never this file. What it looks like is not here. That is the recipe, [SolarDatePickerOpenRecipe]: the calendar's surface, floating or inline, its header's and weekdays' text styles, and the grid's gaps, read cell by cell.`;
      const about = `The calendar a date field opens, or the page holds [inline]: the month, its previous and next, its weekdays from the locale's first ([weekStartsOn] overrides it), and a grid of SolarDatePickerDayCells, as many weeks as the month spans, the days of the months either side disabled. [type] double shows the next month beside it, in the page ([inline]), as Figma draws it; a floating one shows one month. The arrow keys move the focus a day or a week and Enter chooses. [value] and [onChanged] hold the date, a DateTime whose time is ignored; [firstDate], [lastDate] and [selectableDayPredicate] refuse dates. Its month is MaterialLocalizations', its weekdays two letters in the app's locale (intl's, where flutter_localizations loads them; Material's one letter otherwise), as the web writes them.`;
      const texts = MONTHS.flatMap((m) => [
        `'${m.label}': l.formatMonthYear(_shown(${m.offset})),`,
        ...weekdayLayers(m.weekdays).map(
          (l, d) => `'${l}': weekdays[(start + ${d}) % 7],`,
        ),
      ]);
      return `/// SOLAR Date Picker Open.
///
${wrapDoc(header, '/// ')}
///
${wrapDoc(about, '/// ')}
library;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';

import '../generated/components/date_picker_open.dart';
import '../generated/icons.dart';
import '../solar_layers.dart';
import '../solar_states.dart';
import '../solar_target.dart';
import 'solar_date_picker_day_cell.dart';
import 'solar_theme_of.dart';

class SolarDatePickerOpen extends StatefulWidget {
  const SolarDatePickerOpen({
    super.key,
${api.map(([prop, def]) => `    ${dartParam('DatePickerOpen', prop, def)},`).join('\n')}
    this.value,
    this.onChanged,
    this.initialMonth,
    this.firstDate,
    this.lastDate,
    this.selectableDayPredicate,
    this.weekStartsOn,
    this.today,
    this.dayBuilder,
    this.autofocus = false,
  });

${api.map(([prop, def]) => dartField('DatePickerOpen', prop, def)).join('\n')}

  /// The date chosen; null for none. Its time is ignored.
  final DateTime? value;

  /// Called with the date chosen, at midnight.
  final ValueChanged<DateTime>? onChanged;

  /// The month it opens on, any day of it; the chosen date's, or today's, by default.
  final DateTime? initialMonth;

  /// The earliest and latest dates it takes.
  final DateTime? firstDate, lastDate;

  /// Whether a date may be chosen (a weekend, a booked day).
  final bool Function(DateTime date)? selectableDayPredicate;

  /// The week's first day, 0 for Sunday to 6 for Saturday; the locale's by default.
  final int? weekStartsOn;

  /// Today, which it marks; the platform's by default.
  final DateTime? today;

  /// What each day is drawn as, given its date, its grid's month and the cell the calendar builds
  /// for it (a cell with a tooltip, a test's key); the cell by default.
  final Widget Function(DateTime day, DateTime month, SolarDatePickerDayCell cell)?
  dayBuilder;

  /// Whether it moves the focus to its day (the chosen one, or the month's) as it is first built:
  /// a date field's calendar.
  final bool autofocus;

  @override
  State<SolarDatePickerOpen> createState() => _SolarDatePickerOpenState();
}

class _SolarDatePickerOpenState extends State<SolarDatePickerOpen> {
  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
${tree}
  };

  /// The first month shown, and the day the grid's focus is on, which the keyboard moves.
  late DateTime _view, _focus;
  final _nodes = <DateTime, FocusNode>{};

  static DateTime _day(DateTime d) => DateTime(d.year, d.month, d.day);

  @override
  void initState() {
    super.initState();
    // The first month shown, and the day the focus starts on: the chosen day, where it is in the
    // month it opens on, or today, or the month's first.
    final today = _day(widget.today ?? DateTime.now());
    final opening = widget.initialMonth ?? widget.value ?? today;
    _view = DateTime(opening.year, opening.month);
    bool inOpening(DateTime? d) =>
        d != null && d.year == _view.year && d.month == _view.month;
    _focus = inOpening(widget.value)
        ? _day(widget.value!)
        : inOpening(today)
        ? today
        : _view;
    if (widget.autofocus) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) _nodes[_focus]?.requestFocus();
      });
    }
  }

  @override
  void dispose() {
    for (final n in _nodes.values) {
      n.dispose();
    }
    super.dispose();
  }

  DateTime _shown(int offset) => DateTime(_view.year, _view.month + offset);

  bool _refused(DateTime d) =>
      (widget.firstDate != null && d.isBefore(_day(widget.firstDate!))) ||
      (widget.lastDate != null && d.isAfter(_day(widget.lastDate!))) ||
      !(widget.selectableDayPredicate?.call(d) ?? true);

  void _move(DateTime to) {
    // A focus moved past the months shown turns them, so it stays in sight.
    // Two months where the recipe draws the second: Figma draws a double calendar in the page, so
    // a floating one draws one month, and its keyboard keeps to it.
    final w = widget;
    final months =
        SolarDatePickerOpenRecipe.present(
          '${MONTHS[2].grid}',
          SolarDatePickerOpenProps(${api.map(([prop]) => `${prop}: w.${prop}`).join(', ')}),
          const {},
        )
        ? 2
        : 1;
    final past = (to.year - _view.year) * 12 + to.month - _view.month;
    setState(() {
      if (past < 0 || past >= months) {
        _view = DateTime(to.year, to.month + (past < 0 ? 0 : 1 - months));
      }
      _focus = _day(to);
    });
    WidgetsBinding.instance.addPostFrameCallback((_) => _nodes[_focus]?.requestFocus());
  }

  /// The weekday names from Sunday, two letters (\`Mo\`), as the web writes them, in the app's
  /// locale where its date symbols are loaded (flutter_localizations loads them); Material's
  /// one-letter names otherwise.
  static List<String> _weekdayNames(BuildContext context, MaterialLocalizations l) {
    final locale = Intl.canonicalizedLocale(Localizations.localeOf(context).toString());
    if (!DateFormat.localeExists(locale)) return l.narrowWeekdays;
    final format = DateFormat.E(locale);
    String short(String name) => name.length > 2 ? name.substring(0, 2) : name;
    // 4 January 2026 is a Sunday.
    return [for (var d = 0; d < 7; d++) short(format.format(DateTime(2026, 1, 4 + d)))];
  }

  /// The day [days] on, by the calendar (not 24 hours, which a change of clocks makes wrong).
  static DateTime _addDays(DateTime d, int days) =>
      DateTime(d.year, d.month, d.day + days);

  /// The same day [months] on, kept inside a shorter month.
  DateTime _addMonths(DateTime d, int months) {
    final first = DateTime(d.year, d.month + months);
    final last = DateTime(first.year, first.month + 1, 0).day;
    return DateTime(first.year, first.month, d.day > last ? last : d.day);
  }

  /// One month's grid: its weeks, each a row of seven spaced by the grid's gap, which SolarLayers
  /// stacks by the same gap.
  List<Widget> _weeks(BuildContext context, int offset, int start, double gap) {
    final month = _shown(offset);
    final l = MaterialLocalizations.of(context);
    final lead = (month.weekday % 7 - start + 7) % 7;
    final days = DateTime(month.year, month.month + 1, 0).day;
    final count = ((lead + days) / 7).ceil() * 7;
    final today = _day(widget.today ?? DateTime.now());
    final chosen = widget.value == null ? null : _day(widget.value!);
    return [
        for (var w = 0; w < count / 7; w++)
          Row(
            mainAxisSize: MainAxisSize.min,
            spacing: gap,
            children: [
              for (var i = w * 7; i < w * 7 + 7; i++)
                Builder(
                  builder: (context) {
                    final d = DateTime(month.year, month.month, 1 - lead + i);
                    final outside = d.month != month.month;
                    final off = outside || _refused(d);
                    final cell = SolarDatePickerDayCell(
                      label: '\${d.day}',
                      semanticLabel: l.formatFullDate(d),
                      selected: chosen == d,
                      today: today == d,
                      disabled: off,
                      focusNode: outside ? null : (_nodes[d] ??= FocusNode()),
                      onPressed: () {
                        setState(() => _focus = d);
                        widget.onChanged?.call(d);
                      },
                    );
                    return widget.dayBuilder?.call(d, month, cell) ?? cell;
                  },
                ),
            ],
          ),
    ];
  }

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final l = MaterialLocalizations.of(context);
    final w = widget;
    final p = SolarDatePickerOpenProps(${api.map(([prop]) => `${prop}: w.${prop}`).join(', ')});
    const states = <WidgetState>{};
    final start = w.weekStartsOn ?? l.firstDayOfWeekIndex;
    final weekdays = _weekdayNames(context, l);
    double gapOf(String grid) =>
        SolarDatePickerOpenRecipe.dimension('$grid.gap', p, states) ?? 0;
    Widget arrow(int step, String label, Widget icon) => SolarTarget.inside(
      child: SolarPressable(
        onPressed: () => setState(() {
          _view = DateTime(_view.year, _view.month + step);
          _focus = _addMonths(_focus, step);
        }),
        builder: (_, _) => Semantics(label: label, child: icon),
      ),
    );
    final layers = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarDatePickerOpenRecipe.lookup(c, p, states),
        dimension: (c) => SolarDatePickerOpenRecipe.dimension(c, p, states),
        color: (c) => SolarDatePickerOpenRecipe.color(t, c, p, states),
        shadow: (c) => SolarDatePickerOpenRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarDatePickerOpenRecipe.textStyle(t, c, p, states),
        present: (l) => SolarDatePickerOpenRecipe.present(l, p, states),
        glyph: (_) => null,
      ),
      tree: _tree,
      keyPrefix: '${keyPrefixOf(spec.component)}',
      text: {
${texts.map((l) => `        ${l}`).join('\n')}
      },
      icons: const {
${iconsOf(spec)
  .map((i) => `        '${i.layer}': ${i.dart},`)
  .join('\n')}
      },
      content: {
${MONTHS.map((m) => `        '${m.grid}': _weeks(context, ${m.offset}, start, gapOf('${m.grid}')),`).join('\n')}
      },
      builders: {
${MONTHS.flatMap((m) => [
  m.previous
    ? `        '${m.previous}': (icon) => arrow(-1, l.previousMonthTooltip, icon),`
    : null,
  m.next
    ? `        '${m.next}': (icon) => arrow(1, l.nextMonthTooltip, icon),`
    : null,
])
  .filter(Boolean)
  .join('\n')}
${MONTHS.map((m) => `        '${weekdayLayers(m.weekdays)[0].replace(/Weekday$/, '')}': (row) => ExcludeSemantics(child: row),`).join('\n')}
      },
    ).layer('root');
    // The arrow keys move the focus a day or a week, Page Up and Down a month.
    return CallbackShortcuts(
      bindings: {
        const SingleActivator(LogicalKeyboardKey.arrowLeft): () =>
            _move(_addDays(_focus, -1)),
        const SingleActivator(LogicalKeyboardKey.arrowRight): () =>
            _move(_addDays(_focus, 1)),
        const SingleActivator(LogicalKeyboardKey.arrowUp): () =>
            _move(_addDays(_focus, -7)),
        const SingleActivator(LogicalKeyboardKey.arrowDown): () =>
            _move(_addDays(_focus, 7)),
        const SingleActivator(LogicalKeyboardKey.pageUp): () =>
            _move(_addMonths(_focus, -1)),
        const SingleActivator(LogicalKeyboardKey.pageDown): () =>
            _move(_addMonths(_focus, 1)),
      },
      child: FocusTraversalGroup(child: layers),
    );
  }
}
`;
    },
  },
};
