/// SOLAR Date Picker Open.
///
/// Written by hand, and never regenerated; its layer tree is the IR's,
/// [SolarDatePickerOpenRecipe.tree]. What it looks like is not here. That is the recipe,
/// [SolarDatePickerOpenRecipe]: the calendar's surface, floating or inline, its header's and
/// weekdays' text styles, and the grid's gaps, read cell by cell.
///
/// The calendar a date field opens, or the page holds [inline]: the month, its previous and next,
/// its weekdays from the locale's first ([weekStartsOn] overrides it), and a grid of
/// SolarDatePickerDayCells, as many weeks as the month spans, the days of the months either side
/// disabled. [type] double shows the next month beside it, in the page ([inline]), as Figma draws
/// it; a floating one shows one month. The arrow keys move the focus a day or a week and Enter
/// chooses. [value] and [onChanged] hold the date, a DateTime whose time is ignored; [firstDate],
/// [lastDate] and [selectableDayPredicate] refuse dates. Its month is MaterialLocalizations', its
/// weekdays two letters in the app's locale (intl's, where flutter_localizations loads them;
/// Material's one letter otherwise), as the web writes them.
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
    this.inline = false,
    this.type = SolarDatePickerOpenType.single,
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

  final bool inline;
  final SolarDatePickerOpenType type;

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
  final Widget Function(
    DateTime day,
    DateTime month,
    SolarDatePickerDayCell cell,
  )?
  dayBuilder;

  /// Whether it moves the focus to its day (the chosen one, or the month's) as it is first built:
  /// a date field's calendar.
  final bool autofocus;

  @override
  State<SolarDatePickerOpen> createState() => _SolarDatePickerOpenState();
}

class _SolarDatePickerOpenState extends State<SolarDatePickerOpen> {
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
          'container2DayGrid',
          SolarDatePickerOpenProps(inline: w.inline, type: w.type),
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
    WidgetsBinding.instance.addPostFrameCallback(
      (_) => _nodes[_focus]?.requestFocus(),
    );
  }

  /// The weekday names from Sunday, two letters (`Mo`), as the web writes them, in the app's
  /// locale where its date symbols are loaded (flutter_localizations loads them); Material's
  /// one-letter names otherwise.
  static List<String> _weekdayNames(
    BuildContext context,
    MaterialLocalizations l,
  ) {
    final locale = Intl.canonicalizedLocale(
      Localizations.localeOf(context).toString(),
    );
    if (!DateFormat.localeExists(locale)) return l.narrowWeekdays;
    final format = DateFormat.E(locale);
    String short(String name) => name.length > 2 ? name.substring(0, 2) : name;
    // 4 January 2026 is a Sunday.
    return [
      for (var d = 0; d < 7; d++)
        short(format.format(DateTime(2026, 1, 4 + d))),
    ];
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
                    label: '${d.day}',
                    semanticLabel: l.formatFullDate(d),
                    selected: chosen == d,
                    today: today == d,
                    focusNode: outside ? null : (_nodes[d] ??= FocusNode()),
                    onPressed: off
                        ? null
                        : () {
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
    final p = SolarDatePickerOpenProps(inline: w.inline, type: w.type);
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
      tree: SolarDatePickerOpenRecipe.tree,
      keyPrefix: 'datePickerOpen',
      text: {
        'month': l.formatMonthYear(_shown(0)),
        'containerMonthHeaderMonthLabel': l.formatMonthYear(_shown(0)),
        'container2MonthHeaderMonthLabel': l.formatMonthYear(_shown(1)),
      },
      // A week's days, Figma's seven copies of one text: the locale's names, from its first.
      repeats: {
        for (final row in const [
          'weekdayRowWeekday',
          'containerWeekdayRowWeekday',
          'container2WeekdayRowWeekday',
        ])
          row: [for (var i = 0; i < 7; i++) weekdays[(start + i) % 7]],
      },
      icons: const {
        'monthHeaderIconArrowLeft': SolarIcons.arrowLeftOutline,
        'monthHeaderIconArrowRight': SolarIcons.arrowRightOutline,
        'containerMonthHeaderIconArrowLeft': SolarIcons.arrowLeftOutline,
        'container2MonthHeaderIconArrowRight': SolarIcons.arrowRightOutline,
      },
      content: {
        'dayGrid': _weeks(context, 0, start, gapOf('dayGrid')),
        'containerDayGrid': _weeks(
          context,
          0,
          start,
          gapOf('containerDayGrid'),
        ),
        'container2DayGrid': _weeks(
          context,
          1,
          start,
          gapOf('container2DayGrid'),
        ),
      },
      builders: {
        'monthHeaderIconArrowLeft': (icon) =>
            arrow(-1, l.previousMonthTooltip, icon),
        'monthHeaderIconArrowRight': (icon) =>
            arrow(1, l.nextMonthTooltip, icon),
        'containerMonthHeaderIconArrowLeft': (icon) =>
            arrow(-1, l.previousMonthTooltip, icon),
        'container2MonthHeaderIconArrowRight': (icon) =>
            arrow(1, l.nextMonthTooltip, icon),
        'weekdayRow': (row) => ExcludeSemantics(child: row),
        'containerWeekdayRow': (row) => ExcludeSemantics(child: row),
        'container2WeekdayRow': (row) => ExcludeSemantics(child: row),
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
