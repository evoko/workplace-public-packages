import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';
import 'package:solar_flutter/src/solar_time.dart';

Future<void> pump(WidgetTester tester, Widget child) => tester.pumpWidget(
  MaterialApp(
    theme: ThemeData(extensions: const [SolarTheme.light]),
    home: Scaffold(
      body: Align(alignment: Alignment.topCenter, child: child),
    ),
  ),
);

/// The words the app is in: en-US, MaterialApp's own.
MaterialLocalizations words(WidgetTester tester) =>
    MaterialLocalizations.of(tester.element(find.byType(Scaffold)));

/// The day cells drawn for [day], by the whole date they are named by.
Iterable<SolarDatePickerDayCell> cellsOf(WidgetTester tester, DateTime day) {
  final label = words(tester).formatFullDate(day);
  return tester
      .widgetList<SolarDatePickerDayCell>(find.byType(SolarDatePickerDayCell))
      .where((c) => c.semanticLabel == label);
}

/// The day cell the keyboard's focus is in, by its whole date; null where it is in none.
String? focusedDay() => FocusManager.instance.primaryFocus?.context
    ?.findAncestorWidgetOfExactType<SolarDatePickerDayCell>()
    ?.semanticLabel;

/// The words in the only text field.
String fieldWords(WidgetTester tester) =>
    tester.widget<TextField>(find.byType(TextField)).controller!.text;

const fruit = [
  SolarSelectOption(value: 'apple', label: 'Apple'),
  SolarSelectOption(value: 'banana', label: 'Banana'),
  SolarSelectOption(value: 'cherry', label: 'Cherry', disabled: true),
];

const moreFruit = [
  SolarDropdownOption(value: 'apple', label: 'Apple'),
  SolarDropdownOption(value: 'banana', label: 'Banana'),
  SolarDropdownOption(value: 'cherry', label: 'Cherry', disabled: true),
];

void main() {
  group('SolarSelect', () {
    Widget select(List<String> chosen, {bool disabled = false}) =>
        StatefulBuilder(
          builder: (context, setState) => SolarSelect<String>(
            label: 'Fruit',
            placeholder: 'Pick one',
            disabled: disabled,
            options: fruit,
            value: chosen.lastOrNull,
            onChanged: (v) => setState(() => chosen.add(v)),
          ),
        );

    testWidgets(
      'a tap opens its options; choosing one closes it and shows it',
      (tester) async {
        final chosen = <String>[];
        await pump(tester, select(chosen));
        expect(find.text('Pick one'), findsOneWidget);
        expect(find.text('Banana'), findsNothing);
        await tester.tap(find.byKey(const Key('select.field')));
        await tester.pumpAndSettle();
        expect(find.byType(SolarDropdownItem), findsNWidgets(3));
        await tester.tap(find.text('Banana'));
        await tester.pumpAndSettle();
        expect(chosen, ['banana']);
        expect(find.byType(SolarDropdownItem), findsNothing);
        // The field shows the choice, in the placeholder's place.
        expect(find.text('Banana'), findsOneWidget);
        expect(find.text('Pick one'), findsNothing);
      },
    );

    testWidgets('a disabled option is not chosen, and the panel stays open', (
      tester,
    ) async {
      final chosen = <String>[];
      await pump(tester, select(chosen));
      await tester.tap(find.byKey(const Key('select.field')));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Cherry'));
      await tester.pumpAndSettle();
      expect(chosen, isEmpty);
      expect(find.text('Cherry'), findsOneWidget);
    });

    testWidgets('a disabled select does not open', (tester) async {
      await pump(tester, select([], disabled: true));
      await tester.tap(find.byKey(const Key('select.field')));
      await tester.pumpAndSettle();
      expect(find.byType(SolarDropdownItem), findsNothing);
    });

    testWidgets('the down arrow opens it where it has the focus', (
      tester,
    ) async {
      await pump(tester, select([]));
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pumpAndSettle();
      expect(find.byType(SolarDropdownItem), findsNWidgets(3));
    });

    testWidgets('reads as named by its label, its value the choice, expanded', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      await pump(tester, select(['apple']));
      final field = find.byKey(const Key('select.field'));
      expect(
        tester.getSemantics(field),
        isSemantics(
          label: 'Fruit',
          value: 'Apple',
          isButton: true,
          hasExpandedState: true,
          isExpanded: false,
        ),
      );
      await tester.tap(field);
      await tester.pumpAndSettle();
      expect(
        tester.getSemantics(field),
        isSemantics(hasExpandedState: true, isExpanded: true),
      );
      handle.dispose();
    });
  });

  group('SolarDropdown', () {
    Widget dropdown(List<String> chosen, {bool disabled = false}) =>
        StatefulBuilder(
          builder: (context, setState) => SolarDropdown<String>(
            label: 'Fruit',
            placeholder: 'Pick one',
            disabled: disabled,
            options: moreFruit,
            value: chosen.lastOrNull,
            onChanged: (v) => setState(() => chosen.add(v)),
          ),
        );

    testWidgets(
      'a tap opens its options; choosing one closes it and shows it',
      (tester) async {
        final chosen = <String>[];
        await pump(tester, dropdown(chosen));
        await tester.tap(find.byKey(const Key('dropdown.field')));
        await tester.pumpAndSettle();
        expect(find.byType(SolarDropdownMenu), findsOneWidget);
        expect(find.byType(SolarDropdownItem), findsNWidgets(3));
        await tester.tap(find.text('Banana'));
        await tester.pumpAndSettle();
        expect(chosen, ['banana']);
        expect(find.byType(SolarDropdownMenu), findsNothing);
        expect(find.text('Banana'), findsOneWidget);
        expect(find.text('Pick one'), findsNothing);
      },
    );

    testWidgets('a disabled option is not chosen', (tester) async {
      final chosen = <String>[];
      await pump(tester, dropdown(chosen));
      await tester.tap(find.byKey(const Key('dropdown.field')));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Cherry'));
      await tester.pumpAndSettle();
      expect(chosen, isEmpty);
    });

    testWidgets('a disabled dropdown does not open', (tester) async {
      await pump(tester, dropdown([], disabled: true));
      await tester.tap(find.byKey(const Key('dropdown.field')));
      await tester.pumpAndSettle();
      expect(find.byType(SolarDropdownMenu), findsNothing);
    });

    testWidgets('the down arrow opens it where it has the focus', (
      tester,
    ) async {
      await pump(tester, dropdown([]));
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pumpAndSettle();
      expect(find.byType(SolarDropdownItem), findsNWidgets(3));
    });

    testWidgets('reads as named by its label, its value the choice, expanded', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      await pump(tester, dropdown(['apple']));
      final field = find.byKey(const Key('dropdown.field'));
      expect(
        tester.getSemantics(field),
        isSemantics(
          label: 'Fruit',
          value: 'Apple',
          isButton: true,
          hasExpandedState: true,
          isExpanded: false,
        ),
      );
      await tester.tap(field);
      await tester.pumpAndSettle();
      expect(
        tester.getSemantics(field),
        isSemantics(hasExpandedState: true, isExpanded: true),
      );
      handle.dispose();
    });
  });

  group('SolarAutocomplete', () {
    const cities = ['Amsterdam', 'Berlin', 'Bern'];

    testWidgets('suggests the options holding what is typed, and chooses one', (
      tester,
    ) async {
      final chosen = <String>[];
      await pump(
        tester,
        SolarAutocomplete<String>(
          label: 'City',
          options: cities,
          onSelected: chosen.add,
        ),
      );
      // Nothing typed, nothing suggested.
      expect(find.byType(SolarDropdownItem), findsNothing);
      // Matched in any case.
      await tester.enterText(find.byType(TextField), 'bER');
      await tester.pumpAndSettle();
      expect(find.byType(SolarDropdownItem), findsNWidgets(2));
      expect(find.text('Berlin'), findsOneWidget);
      expect(find.text('Amsterdam'), findsNothing);
      await tester.tap(find.text('Bern'));
      await tester.pumpAndSettle();
      expect(chosen, ['Bern']);
      expect(fieldWords(tester), 'Bern');
      expect(find.byType(SolarDropdownItem), findsNothing);
    });

    testWidgets('where nothing matches, suggests nothing', (tester) async {
      await pump(tester, const SolarAutocomplete<String>(options: cities));
      await tester.enterText(find.byType(TextField), 'xyz');
      await tester.pumpAndSettle();
      expect(find.byType(SolarDropdownItem), findsNothing);
      expect(find.byType(SolarDropdownMenu), findsNothing);
    });
  });

  group('SolarDatePickerDayCell', () {
    testWidgets('calls onPressed on a tap, and not when disabled', (
      tester,
    ) async {
      var pressed = 0;
      await pump(
        tester,
        SolarDatePickerDayCell(label: '11', onPressed: () => pressed++),
      );
      await tester.tap(find.text('11'));
      expect(pressed, 1);
      await pump(
        tester,
        SolarDatePickerDayCell(
          label: '11',
          disabled: true,
          onPressed: () => pressed++,
        ),
      );
      await tester.tap(find.text('11'));
      expect(pressed, 1);
    });

    testWidgets('is named by its whole date, and announced selected', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      await pump(
        tester,
        SolarDatePickerDayCell(
          label: '11',
          semanticLabel: 'Monday, May 11, 2026',
          selected: true,
          onPressed: () {},
        ),
      );
      // The date alone: its figure is not read beside it.
      expect(
        tester.getSemantics(find.byType(SolarDatePickerDayCell)),
        isSemantics(
          label: 'Monday, May 11, 2026',
          isButton: true,
          hasSelectedState: true,
          isSelected: true,
          isEnabled: true,
          hasEnabledState: true,
        ),
      );
      handle.dispose();
    });
  });

  group('SolarDatePickerOpen', () {
    final april = DateTime(2026, 4);

    Widget calendar({
      ValueChanged<DateTime>? onChanged,
      DateTime? firstDate,
      DateTime? lastDate,
      bool Function(DateTime)? selectableDayPredicate,
      SolarDatePickerOpenType type = SolarDatePickerOpenType.single,
      bool inline = false,
      bool autofocus = false,
    }) => SolarDatePickerOpen(
      autofocus: autofocus,
      inline: inline,
      initialMonth: april,
      weekStartsOn: 1,
      today: DateTime(2026, 4, 1),
      type: type,
      onChanged: onChanged,
      firstDate: firstDate,
      lastDate: lastDate,
      selectableDayPredicate: selectableDayPredicate,
    );

    // Two letters, as the web writes them (owner decision), from the week's first day.
    testWidgets(
      'names its weekdays in two letters, from the week’s first day',
      (tester) async {
        await pump(tester, calendar());
        final names = [
          for (final t in tester.widgetList<Text>(
            find.descendant(
              of: find.byKey(const ValueKey('datePickerOpen.weekdayRow')),
              matching: find.byType(Text),
            ),
          ))
            t.data,
        ];
        expect(names, ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']);
      },
    );

    testWidgets('shows its month, its days enabled, the others disabled', (
      tester,
    ) async {
      await pump(tester, calendar());
      expect(find.text(words(tester).formatMonthYear(april)), findsOneWidget);
      final cells = tester.widgetList<SolarDatePickerDayCell>(
        find.byType(SolarDatePickerDayCell),
      );
      // Monday 30 March to Sunday 3 May: five weeks.
      expect(cells, hasLength(35));
      expect(cells.where((c) => !c.disabled), hasLength(30));
      expect(cellsOf(tester, DateTime(2026, 3, 30)).single.disabled, isTrue);
      expect(cellsOf(tester, DateTime(2026, 5, 3)).single.disabled, isTrue);
      expect(cellsOf(tester, DateTime(2026, 4, 1)).single.today, isTrue);
    });

    testWidgets('a tap on a day calls onChanged with it, at midnight', (
      tester,
    ) async {
      final chosen = <DateTime>[];
      await pump(tester, calendar(onChanged: chosen.add));
      await tester.tap(
        find.bySemanticsLabel(
          RegExp(words(tester).formatFullDate(DateTime(2026, 4, 15))),
        ),
      );
      expect(chosen, [DateTime(2026, 4, 15)]);
    });

    testWidgets('firstDate, lastDate and the predicate refuse days', (
      tester,
    ) async {
      await pump(
        tester,
        calendar(
          firstDate: DateTime(2026, 4, 5, 18),
          lastDate: DateTime(2026, 4, 25),
          selectableDayPredicate: (d) => d.day != 15,
        ),
      );
      bool off(int day) =>
          cellsOf(tester, DateTime(2026, 4, day)).single.disabled;
      expect(off(4), isTrue);
      // firstDate's time is ignored: its day is taken.
      expect(off(5), isFalse);
      expect(off(15), isTrue);
      expect(off(25), isFalse);
      expect(off(26), isTrue);
    });

    testWidgets('its arrows turn the month back and on', (tester) async {
      await pump(tester, calendar());
      final l = words(tester);
      await tester.tap(find.bySemanticsLabel(l.nextMonthTooltip));
      await tester.pump();
      expect(find.text(l.formatMonthYear(DateTime(2026, 5))), findsOneWidget);
      await tester.tap(find.bySemanticsLabel(l.previousMonthTooltip));
      await tester.tap(find.bySemanticsLabel(l.previousMonthTooltip));
      await tester.pump();
      expect(find.text(l.formatMonthYear(DateTime(2026, 3))), findsOneWidget);
    });

    testWidgets('inline and double, shows its month and the next', (
      tester,
    ) async {
      await pump(
        tester,
        calendar(inline: true, type: SolarDatePickerOpenType.double),
      );
      final l = words(tester);
      expect(find.text(l.formatMonthYear(april)), findsOneWidget);
      expect(find.text(l.formatMonthYear(DateTime(2026, 5))), findsOneWidget);
      final cells = tester.widgetList<SolarDatePickerDayCell>(
        find.byType(SolarDatePickerDayCell),
      );
      // Five weeks each: 30 March to 3 May, and 27 April to 31 May.
      expect(cells, hasLength(70));
      expect(cells.where((c) => !c.disabled), hasLength(30 + 31));
      expect(cellsOf(tester, DateTime(2026, 5, 31)).single.disabled, isFalse);
    });

    testWidgets(
      'the keys move the focus a day, a week and a month; Enter chooses',
      (tester) async {
        final chosen = <DateTime>[];
        await pump(tester, calendar(autofocus: true, onChanged: chosen.add));
        await tester.pump();
        final l = words(tester);
        String day(int month, int day) =>
            l.formatFullDate(DateTime(2026, month, day));
        // On the month's first day, as it is built.
        expect(focusedDay(), day(4, 1));
        await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
        await tester.pump();
        expect(focusedDay(), day(4, 2));
        await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
        await tester.pump();
        expect(focusedDay(), day(4, 9));
        await tester.sendKeyEvent(LogicalKeyboardKey.pageDown);
        await tester.pump();
        // Past the month shown, which turns to it.
        expect(focusedDay(), day(5, 9));
        expect(find.text(l.formatMonthYear(DateTime(2026, 5))), findsOneWidget);
        await tester.sendKeyEvent(LogicalKeyboardKey.enter);
        expect(chosen, [DateTime(2026, 5, 9)]);
      },
    );

    testWidgets('the keys turn the month as they move past it', (tester) async {
      await pump(tester, calendar());
      final l = words(tester);
      bool shows(int month) => find
          .text(l.formatMonthYear(DateTime(2026, month)))
          .evaluate()
          .isNotEmpty;
      // Into the calendar, its day the month's first.
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.sendKeyEvent(LogicalKeyboardKey.pageDown);
      await tester.pump();
      expect(shows(5), isTrue);
      await tester.sendKeyEvent(LogicalKeyboardKey.pageUp);
      await tester.pump();
      expect(shows(4), isTrue);
      // A week back from 1 April is in March; a day on from 31 March, April again.
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowUp);
      await tester.pump();
      expect(shows(3), isTrue);
      for (var i = 0; i < 7; i++) {
        await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      }
      await tester.pump();
      expect(shows(4), isTrue);
      // Five weeks on from 1 April is 6 May.
      for (var i = 0; i < 5; i++) {
        await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      }
      await tester.pump();
      expect(shows(5), isTrue);
    });
  });

  group('SolarDatePicker', () {
    Widget picker(
      List<DateTime?> chosen, {
      bool disabled = false,
      DateTime? value,
    }) => StatefulBuilder(
      builder: (context, setState) => SolarDatePicker(
        label: 'Start',
        disabled: disabled,
        value: chosen.isEmpty ? value : chosen.last,
        onDateChanged: (v) => setState(() => chosen.add(v)),
      ),
    );

    testWidgets('shows its date in the locale’s figures', (tester) async {
      await pump(tester, picker([], value: DateTime(2026, 5, 11)));
      expect(fieldWords(tester), '05/11/2026');
    });

    testWidgets('reads typed words back on submit; cleared, as no date', (
      tester,
    ) async {
      final chosen = <DateTime?>[];
      await pump(tester, picker(chosen, value: DateTime(2026, 5, 11)));
      await tester.enterText(find.byType(TextField), '06/01/2026');
      await tester.testTextInput.receiveAction(TextInputAction.done);
      await tester.pump();
      expect(chosen, [DateTime(2026, 6)]);
      await tester.enterText(find.byType(TextField), '');
      await tester.testTextInput.receiveAction(TextInputAction.done);
      await tester.pump();
      expect(chosen, [DateTime(2026, 6), null]);
    });

    testWidgets('leaves its date as it was where the words are no date', (
      tester,
    ) async {
      final chosen = <DateTime?>[];
      await pump(tester, picker(chosen, value: DateTime(2026, 5, 11)));
      await tester.enterText(find.byType(TextField), 'next week');
      await tester.testTextInput.receiveAction(TextInputAction.done);
      await tester.pump();
      expect(chosen, isEmpty);
    });

    testWidgets(
      'its calendar icon opens the calendar; a day picked closes it',
      (tester) async {
        final chosen = <DateTime?>[];
        await pump(tester, picker(chosen, value: DateTime(2026, 5, 11)));
        final l = words(tester);
        expect(find.byType(SolarDatePickerOpen), findsNothing);
        await tester.tap(find.bySemanticsLabel(l.datePickerHelpText));
        await tester.pumpAndSettle();
        expect(find.byType(SolarDatePickerOpen), findsOneWidget);
        // On the chosen date's month, the focus on its day.
        expect(find.text(l.formatMonthYear(DateTime(2026, 5))), findsOneWidget);
        expect(focusedDay(), l.formatFullDate(DateTime(2026, 5, 11)));
        await tester.tap(
          find.bySemanticsLabel(
            RegExp(l.formatFullDate(DateTime(2026, 5, 20))),
          ),
        );
        await tester.pumpAndSettle();
        expect(chosen, [DateTime(2026, 5, 20)]);
        expect(find.byType(SolarDatePickerOpen), findsNothing);
        expect(fieldWords(tester), '05/20/2026');
      },
    );

    testWidgets('the down arrow in the field opens the calendar', (
      tester,
    ) async {
      await pump(tester, picker([]));
      await tester.tap(find.byType(TextField));
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pumpAndSettle();
      expect(find.byType(SolarDatePickerOpen), findsOneWidget);
    });

    testWidgets('a disabled picker does not open', (tester) async {
      await pump(tester, picker([], disabled: true));
      await tester.tap(
        find.bySemanticsLabel(words(tester).datePickerHelpText),
        warnIfMissed: false,
      );
      await tester.pumpAndSettle();
      expect(find.byType(SolarDatePickerOpen), findsNothing);
    });
  });

  group('SolarTimePicker', () {
    Widget picker(List<TimeOfDay?> chosen, {TimeOfDay? value}) =>
        StatefulBuilder(
          builder: (context, setState) => SolarTimePicker(
            label: 'At',
            value: chosen.isEmpty ? value : chosen.last,
            onTimeChanged: (v) => setState(() => chosen.add(v)),
          ),
        );

    testWidgets('shows its time as the locale writes it', (tester) async {
      await pump(
        tester,
        picker([], value: const TimeOfDay(hour: 21, minute: 30)),
      );
      expect(fieldWords(tester), '9:30 PM');
    });

    testWidgets('reads typed words back on submit', (tester) async {
      final chosen = <TimeOfDay?>[];
      await pump(tester, picker(chosen));
      await tester.enterText(find.byType(TextField), '9:30 PM');
      await tester.testTextInput.receiveAction(TextInputAction.done);
      await tester.pump();
      expect(chosen, [const TimeOfDay(hour: 21, minute: 30)]);
    });

    testWidgets('its clock icon opens the times; one picked closes them', (
      tester,
    ) async {
      final chosen = <TimeOfDay?>[];
      await pump(
        tester,
        picker(chosen, value: const TimeOfDay(hour: 9, minute: 0)),
      );
      await tester.tap(
        find.bySemanticsLabel(words(tester).timePickerDialHelpText),
      );
      await tester.pumpAndSettle();
      expect(find.byType(SolarTimePickerDropdown), findsOneWidget);
      await tester.tap(find.text('9:30 AM'));
      await tester.pumpAndSettle();
      expect(chosen, [const TimeOfDay(hour: 9, minute: 30)]);
      expect(find.byType(SolarTimePickerDropdown), findsNothing);
      expect(fieldWords(tester), '9:30 AM');
    });
  });

  group('SolarTimePickerDropdown', () {
    testWidgets('lists the times a step apart, first to last, inclusive', (
      tester,
    ) async {
      final chosen = <TimeOfDay>[];
      await pump(
        tester,
        SolarTimePickerDropdown(
          step: 15,
          first: const TimeOfDay(hour: 9, minute: 0),
          last: const TimeOfDay(hour: 10, minute: 0),
          value: const TimeOfDay(hour: 9, minute: 30),
          onChanged: chosen.add,
        ),
      );
      final rows = tester.widgetList<SolarDropdownItem>(
        find.byType(SolarDropdownItem),
      );
      expect(rows.map((r) => r.label), [
        '9:00 AM',
        '9:15 AM',
        '9:30 AM',
        '9:45 AM',
        '10:00 AM',
      ]);
      // The value is the one selected.
      expect(rows.where((r) => r.selected).map((r) => r.label), ['9:30 AM']);
      await tester.tap(find.text('9:45 AM'));
      expect(chosen, [const TimeOfDay(hour: 9, minute: 45)]);
    });

    testWidgets('by default, every half hour of the day', (tester) async {
      await pump(tester, const SolarTimePickerDropdown());
      expect(find.byType(SolarDropdownItem), findsNWidgets(48));
    });
  });

  group('parseSolarTime', () {
    const l = DefaultMaterialLocalizations();
    TimeOfDay? parse(String s) => parseSolarTime(s, l);

    test('reads either clock, with or without the minutes', () {
      expect(parse('9:30 AM'), const TimeOfDay(hour: 9, minute: 30));
      expect(parse('9.30pm'), const TimeOfDay(hour: 21, minute: 30));
      expect(parse('21:30'), const TimeOfDay(hour: 21, minute: 30));
      expect(parse('2130'), const TimeOfDay(hour: 21, minute: 30));
      expect(parse('9'), const TimeOfDay(hour: 9, minute: 0));
    });

    test('reads midnight and noon on the twelve-hour clock', () {
      expect(parse('12:00 AM'), const TimeOfDay(hour: 0, minute: 0));
      expect(parse('12 pm'), const TimeOfDay(hour: 12, minute: 0));
    });

    test('is null where the words are no time', () {
      for (final s in ['25:00', '13pm', '7:61', 'abc']) {
        expect(parse(s), isNull, reason: s);
      }
    });
  });

  group('solarTimesOf', () {
    test('is every step of the day, or first to last inclusive', () {
      final day = solarTimesOf(30);
      expect(day, hasLength(48));
      expect(day.first, const TimeOfDay(hour: 0, minute: 0));
      expect(day.last, const TimeOfDay(hour: 23, minute: 30));
      expect(
        solarTimesOf(
          60,
          first: const TimeOfDay(hour: 8, minute: 0),
          last: const TimeOfDay(hour: 11, minute: 0),
        ),
        [for (var h = 8; h <= 11; h++) TimeOfDay(hour: h, minute: 0)],
      );
    });
  });
}
