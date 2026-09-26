// The menus', lists' and pickers' Playground builders driven through the real Widgetbook adapter:
// choosing in the component sets its knob and is logged with the widget's callback's name; a menu
// opens from its trigger and closes on a choice; words from the panel that are no date or time
// choose nothing. That every builder renders at its defaults, and every overlay opens and closes
// from `open`, is playground_test.dart's.

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';
import 'package:solar_widgetbook/playground/registry.dart';
import 'package:widgetbook/widgetbook.dart';

import 'helpers.dart';

Future<WidgetbookState> _pump(WidgetTester tester, String component) =>
    pumpPlayground(tester, component, playgroundBuilders[component]!);

void _knob(WidgetbookState state, String field, String value) =>
    state.updateQueryField(group: 'knobs', field: field, value: value);

/// A widget of a generic type whatever its type argument (a builder's sample enum).
Finder _any<T>() => find.byWidgetPredicate((w) => w is T);

/// [text] in the widget [of] finds, not in a knob's field in the panel.
Finder _in(Finder of, String text) =>
    find.descendant(of: of, matching: find.text(text));

void main() {
  testWidgets('Select: choosing an option shows it and sets value', (
    tester,
  ) async {
    final state = await _pump(tester, 'Select');
    expect(find.text('Placeholder'), findsOneWidget);
    await tester.tap(_any<SolarSelect>());
    await tester.pumpAndSettle();
    await tester.tap(find.text('Option 2'));
    await tester.pumpAndSettle();
    expect(knobsOf(state)['value'], 'Option 2');
    expect(find.text('1. onChanged: "Option 2"'), findsOneWidget);
    // The panel closed, and the field shows the choice.
    expect(find.text('Option 1'), findsNothing);
    expect(_in(_any<SolarSelect>(), 'Option 2'), findsOneWidget);
    // `open` from the panel opens it; off, it closes.
    _knob(state, 'open', 'true');
    await tester.pumpAndSettle();
    expect(find.text('Option 1'), findsOneWidget);
    _knob(state, 'open', 'false');
    await tester.pumpAndSettle();
    expect(find.text('Option 1'), findsNothing);
    expect(tester.takeException(), isNull);
  });

  testWidgets(
    'Dropdown Menu: Open shows it; choosing a row logs it and closes it',
    (tester) async {
      final state = await _pump(tester, 'Dropdown Menu');
      expect(find.text('Option 2'), findsNothing);
      await tester.tap(find.text('Open'));
      await tester.pumpAndSettle();
      expect(knobsOf(state)['open'], 'true');
      expect(find.text('Group Label'), findsOneWidget);
      await tester.tap(find.text('Option 2'));
      await tester.pumpAndSettle();
      expect(find.text('Option 2'), findsNothing);
      expect(knobsOf(state)['open'], 'false');
      expect(find.text('1. onPressed: "Option 2"'), findsOneWidget);
      // Escape closes it too, which clears `open` and is logged.
      await tester.tap(find.text('Open'));
      await tester.pumpAndSettle();
      expect(find.text('Option 2'), findsOneWidget);
      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();
      expect(find.text('Option 2'), findsNothing);
      expect(knobsOf(state)['open'], 'false');
      expect(find.text('1. onClose'), findsOneWidget);
      expect(tester.takeException(), isNull);
    },
  );

  testWidgets(
    'DatePicker: picking a day sets value; words that are no date choose none',
    (tester) async {
      final state = await _pump(tester, 'DatePicker');
      SolarDatePicker picker() => tester.widget(find.byType(SolarDatePicker));
      expect(picker().value, DateTime(2026, 5, 11));
      await tester.tap(find.bySemanticsLabel('Select date'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('20'));
      await tester.pumpAndSettle();
      expect(knobsOf(state)['value'], '2026-05-20');
      expect(picker().value, DateTime(2026, 5, 20));
      expect(find.text('1. onDateChanged: "2026-05-20"'), findsOneWidget);
      _knob(state, 'value', '2026-02-30');
      await tester.pump();
      expect(picker().value, isNull);
      expect(tester.takeException(), isNull);
    },
  );

  testWidgets(
    'TimePicker: picking a time sets value, HH:MM; Figma\'s words are read',
    (tester) async {
      final state = await _pump(tester, 'TimePicker');
      SolarTimePicker picker() => tester.widget(find.byType(SolarTimePicker));
      // Figma's 12:00 AM, on the 12-hour clock.
      expect(picker().value, const TimeOfDay(hour: 0, minute: 0));
      await tester.tap(find.bySemanticsLabel('Select time'));
      await tester.pumpAndSettle();
      await tester.scrollUntilVisible(
        find.text('9:30 PM'),
        100,
        scrollable: find.byType(Scrollable).last,
      );
      await tester.tap(find.text('9:30 PM'));
      await tester.pumpAndSettle();
      expect(knobsOf(state)['value'], '21:30');
      expect(picker().value, const TimeOfDay(hour: 21, minute: 30));
      expect(find.text('1. onTimeChanged: "21:30"'), findsOneWidget);
      _knob(state, 'value', '25:00');
      await tester.pump();
      expect(picker().value, isNull);
      expect(tester.takeException(), isNull);
    },
  );

  testWidgets(
    'Autocomplete: typing suggests; choosing a suggestion sets value',
    (tester) async {
      final state = await _pump(tester, 'Autocomplete');
      final input = find.descendant(
        of: find.byType(SolarAutocomplete<String>),
        matching: find.byType(EditableText),
      );
      await tester.tap(input);
      await tester.enterText(input, 'on');
      await tester.pumpAndSettle();
      expect(knobsOf(state)['value'], 'on');
      expect(find.text('1. onChanged: "on"'), findsOneWidget);
      // Of the sample suggestions, only London holds "on".
      expect(find.text('London'), findsOneWidget);
      expect(find.text('Berlin'), findsNothing);
      await tester.tap(find.text('London'));
      await tester.pumpAndSettle();
      expect(knobsOf(state)['value'], 'London');
      expect(find.text('1. onSelected: "London"'), findsOneWidget);
      expect(tester.takeException(), isNull);
    },
  );

  testWidgets('Autocomplete Open: its suggestions show for its words', (
    tester,
  ) async {
    await _pump(tester, 'Autocomplete Open');
    await tester.pumpAndSettle();
    for (final city in [
      'Berlin',
      'Copenhagen',
      'Dublin',
      'Edinburgh',
      'London',
    ]) {
      expect(find.text(city), findsOneWidget);
    }
  });

  testWidgets(
    'Option Row: a tap sets checked; a radio row is checked in its group',
    (tester) async {
      final state = await _pump(tester, 'Option Row');
      final row = _in(_any<SolarOptionRow>(), 'Option label');
      await tester.tap(row);
      await tester.pump();
      expect(knobsOf(state)['checked'], 'true');
      expect(find.text('1. onChanged: true'), findsOneWidget);
      _knob(state, 'checked', 'false');
      _knob(state, 'control', 'radio');
      await tester.pump();
      expect(_any<RadioGroup>(), findsOneWidget);
      await tester.tap(row);
      await tester.pump();
      expect(knobsOf(state)['checked'], 'true');
    },
  );

  testWidgets('Options List: a tap checks a row, in the rows\' order', (
    tester,
  ) async {
    final state = await _pump(tester, 'Options List');
    final list = find.byType(SolarOptionsList);
    await tester.tap(_in(list, 'Push'));
    await tester.pump();
    expect(knobsOf(state)['checked'], 'Email, Push');
    expect(find.text('1. onChanged: {"Push":true}'), findsOneWidget);
    await tester.tap(_in(list, 'Email'));
    await tester.pump();
    expect(knobsOf(state)['checked'], 'Push');
  });
}
