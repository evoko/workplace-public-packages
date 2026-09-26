// The five pilot Playground builders (Button, Checkbox, Text Input, Pagination, Dialog) driven
// through the real Widgetbook adapter: a knob reaches the component, and the component's own change
// reaches the knob (two-way). That every builder renders at its defaults is playground_test.dart's.

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';
import 'package:solar_widgetbook/playground/registry.dart';

import 'helpers.dart';

/// The Button the Playground shows, not its Reset button.
final _button = find.byWidgetPredicate(
  (w) =>
      w is SolarButton &&
      !(w.child is Text && (w.child! as Text).data == 'Reset'),
);

void main() {
  testWidgets('Button: label, icons, counter, onPressed', (tester) async {
    final state = await pumpPlayground(
      tester,
      'Button',
      playgroundBuilders['Button']!,
    );
    expect(find.text('Label'), findsWidgets);
    expect(find.byType(SolarCounter), findsNothing);
    state.updateQueryField(group: 'knobs', field: 'counter', value: 'true');
    state.updateQueryField(
      group: 'knobs',
      field: 'iconLeading',
      value: 'chevron-right solid',
    );
    await tester.pump();
    expect(find.byType(SolarCounter), findsOneWidget);
    expect(tester.widget<SolarCounter>(find.byType(SolarCounter)).count, 3);
    // The builder names no type: the primary Button gives its Counter the recipe's, inverted.
    expect(tester.widget<SolarCounter>(find.byType(SolarCounter)).type, isNull);
    expect(
      SolarCounterTypeScope.maybeOf(tester.element(find.byType(SolarCounter))),
      SolarCounterType.inverted,
    );
    expect(find.byType(SolarIcon), findsWidgets);
    await tester.tap(_button);
    await tester.pump();
    expect(find.text('1. onPressed'), findsOneWidget);
    state.updateQueryField(group: 'knobs', field: 'label', value: '');
    await tester.pump();
    expect(tester.widget<SolarButton>(_button).semanticLabel, 'Label');
    state.updateQueryField(group: 'knobs', field: 'disabled', value: 'true');
    await tester.pump();
    expect(tester.widget<SolarButton>(_button).onPressed, isNull);
  });

  testWidgets('Checkbox: tap sets checked and clears mixed', (tester) async {
    final state = await pumpPlayground(
      tester,
      'Checkbox',
      playgroundBuilders['Checkbox']!,
    );
    state.updateQueryField(group: 'knobs', field: 'mixed', value: 'true');
    await tester.pump();
    await tester.tap(find.byType(SolarCheckbox));
    await tester.pump();
    expect(knobsOf(state)['checked'], 'true');
    expect(knobsOf(state)['mixed'], 'false');
    expect(find.text('1. onChanged: true'), findsOneWidget);
  });

  testWidgets(
    'Text Input: typing sets value, keeps focus and cursor; panel sets words',
    (tester) async {
      final state = await pumpPlayground(
        tester,
        'Text Input',
        playgroundBuilders['Text Input']!,
      );
      final input = find.descendant(
        of: find.byType(SolarTextInput),
        matching: find.byType(EditableText),
      );
      await tester.tap(input);
      await tester.pump();
      await tester.enterText(input, 'ab');
      await tester.pump();
      expect(knobsOf(state)['value'], 'ab');
      var field = tester.state<EditableTextState>(input);
      expect(field.widget.focusNode.hasFocus, isTrue);
      expect(field.widget.controller.text, 'ab');
      // Move the cursor to the middle and type: it stays where it was put.
      tester.testTextInput.updateEditingValue(
        const TextEditingValue(
          text: 'axb',
          selection: TextSelection.collapsed(offset: 2),
        ),
      );
      await tester.pump();
      expect(knobsOf(state)['value'], 'axb');
      field = tester.state<EditableTextState>(input);
      expect(field.widget.controller.selection.baseOffset, 2);
      expect(find.text('1. onChanged: "axb"'), findsOneWidget);
      state.updateQueryField(
        group: 'knobs',
        field: 'value',
        value: 'from panel',
      );
      await tester.pump();
      expect(
        tester.state<EditableTextState>(input).widget.controller.text,
        'from panel',
      );
      state.updateQueryField(group: 'knobs', field: 'mandatory', value: '*');
      state.updateQueryField(group: 'knobs', field: 'helper', value: '');
      await tester.pump();
      final w = tester.widget<SolarTextInput>(find.byType(SolarTextInput));
      expect(w.mandatory, isTrue);
      expect(w.helper, isNull);
    },
  );

  testWidgets('Pagination: tapping a page sets page', (tester) async {
    final state = await pumpPlayground(
      tester,
      'Pagination',
      playgroundBuilders['Pagination']!,
    );
    await tester.tap(find.text('3'));
    await tester.pump();
    expect(knobsOf(state)['page'], '3');
    expect(
      tester.widget<SolarPagination>(find.byType(SolarPagination)).page,
      3,
    );
    expect(find.text('1. onChanged: 3'), findsOneWidget);
    // Fewer pages than the current one: the last page shows, and is written back.
    state.updateQueryField(group: 'knobs', field: 'count', value: '2');
    await tester.pump();
    expect(
      tester.widget<SolarPagination>(find.byType(SolarPagination)).page,
      2,
    );
    await tester.pump();
    expect(knobsOf(state)['page'], '2');
    expect(tester.takeException(), isNull);
  });

  testWidgets('Dialog: Open shows it; close hides it and resets open', (
    tester,
  ) async {
    final state = await pumpPlayground(
      tester,
      'Dialog',
      playgroundBuilders['Dialog']!,
    );
    await tester.tap(find.text('Open'));
    await settle(tester);
    expect(knobsOf(state)['open'], 'true');
    expect(find.byType(SolarDialog), findsOneWidget);
    // The controls reach the open dialog.
    state.updateQueryField(group: 'knobs', field: 'title', value: 'Hello');
    state.updateQueryField(group: 'knobs', field: 'modalImage', value: 'false');
    await settle(tester);
    expect(tester.widget<SolarDialog>(find.byType(SolarDialog)).title, 'Hello');
    expect(
      tester.widget<SolarDialog>(find.byType(SolarDialog)).stepper,
      isNotNull,
    );
    await tester.tap(find.bySemanticsLabel('Close'));
    await settle(tester);
    expect(find.byType(SolarDialog), findsNothing);
    expect(knobsOf(state)['open'], 'false');
    expect(find.text('1. onClose'), findsOneWidget);
    // The panel opens and closes it.
    state.updateQueryField(group: 'knobs', field: 'open', value: 'true');
    await settle(tester);
    expect(find.byType(SolarDialog), findsOneWidget);
    state.updateQueryField(group: 'knobs', field: 'open', value: 'false');
    await settle(tester);
    expect(find.byType(SolarDialog), findsNothing);
    expect(find.text('2. onClose'), findsNothing);
    // An action closes it.
    await tester.tap(find.text('Open'));
    await settle(tester);
    await tester.tap(find.text('Continue'));
    await settle(tester);
    expect(find.byType(SolarDialog), findsNothing);
    expect(knobsOf(state)['open'], 'false');
    expect(find.text('1. actions: "Continue"'), findsOneWidget);
    // Escape closes it, as the route's own way of closing.
    await tester.tap(find.text('Open'));
    await settle(tester);
    await tester.sendKeyEvent(LogicalKeyboardKey.escape);
    await settle(tester);
    expect(find.byType(SolarDialog), findsNothing);
    expect(knobsOf(state)['open'], 'false');
    expect(find.text('1. onClose'), findsOneWidget);
  });

  testWidgets('Dialog: leaving the use case while it is open pops its route', (
    tester,
  ) async {
    final shown = ValueNotifier(true);
    final state = await pumpPlayground(
      tester,
      'Dialog',
      playgroundBuilders['Dialog']!,
      shown: shown,
    );
    await tester.tap(find.text('Open'));
    await settle(tester);
    expect(find.byType(SolarDialog), findsOneWidget);
    shown.value = false;
    await settle(tester);
    expect(tester.takeException(), isNull);
    expect(find.byType(SolarDialog), findsNothing);
    expect(find.text('Open'), findsNothing);
    // The Playground was gone when the route closed: nothing is written back.
    expect(knobsOf(state)['open'], 'true');
    // Coming back, the control still open, shows it again.
    shown.value = true;
    await settle(tester);
    expect(tester.takeException(), isNull);
    expect(find.byType(SolarDialog), findsOneWidget);
  });
}
