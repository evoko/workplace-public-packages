// The text fields' Playground builders driven through the real Widgetbook adapter: typing keeps the
// focus, the cursor where the tester puts it and every keystroke, however fast; what a field makes
// of the words (a step, a filter, an entry) is what its knob holds; and each callback is logged.
// That every builder renders at its defaults is playground_test.dart's; Text Input's typing is
// playground_pilots_test.dart's.

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

/// The text field inside the widget [of] finds, not a knob's in the panel.
Finder _input(Finder of) =>
    find.descendant(of: of, matching: find.byType(EditableText));

TextEditingController _controller(WidgetTester tester, Finder input) =>
    tester.state<EditableTextState>(input).widget.controller;

void main() {
  testWidgets(
    'Text Area: typing mid-word keeps the cursor there, and fast typing drops nothing',
    (tester) async {
      final state = await _pump(tester, 'Text Area');
      final area = find.byType(SolarTextArea);
      final input = _input(area);
      SolarIconButton send() => tester.widget<SolarIconButton>(
        find.byWidgetPredicate(
          (w) => w is SolarIconButton && w.semanticLabel == 'Send',
        ),
      );
      expect(send().onPressed, isNull);
      await tester.tap(input);
      await tester.pump();
      await tester.enterText(input, 'helo wrld');
      await tester.pump();
      // Back into "wrld", then into "helo": each letter goes where the cursor is.
      tester.testTextInput.updateEditingValue(
        const TextEditingValue(
          text: 'helo world',
          selection: TextSelection.collapsed(offset: 7),
        ),
      );
      await tester.pump();
      tester.testTextInput.updateEditingValue(
        const TextEditingValue(
          text: 'hello world',
          selection: TextSelection.collapsed(offset: 4),
        ),
      );
      await tester.pump();
      expect(knobsOf(state)['value'], 'hello world');
      expect(_controller(tester, input).selection.baseOffset, 4);
      expect(
        tester.state<EditableTextState>(input).widget.focusNode.hasFocus,
        isTrue,
      );
      // Fast: keystrokes arriving before the rebuild the first one's write makes.
      var words = 'hello world';
      for (final c in ', typed fast'.split('')) {
        words += c;
        tester.testTextInput.updateEditingValue(
          TextEditingValue(
            text: words,
            selection: TextSelection.collapsed(offset: words.length),
          ),
        );
      }
      await tester.pump();
      expect(knobsOf(state)['value'], 'hello world, typed fast');
      expect(_controller(tester, input).text, 'hello world, typed fast');
      expect(
        _controller(tester, input).selection.baseOffset,
        'hello world, typed fast'.length,
      );
      expect(
        find.text('1. onChanged: "hello world, typed fast"'),
        findsOneWidget,
      );
      // Something to send: the call to action is enabled, and its tap logged with its slot.
      await tester.tap(find.bySemanticsLabel('Send'));
      await tester.pump();
      expect(find.text('1. onPressed: "cta"'), findsOneWidget);
      // The count's words say what it counts against; the footer hides it with the helper.
      expect(tester.widget<SolarTextArea>(area).maxLength, 500);
      _knob(state, 'charCount', '12');
      await tester.pump();
      expect(tester.widget<SolarTextArea>(area).charCount, isTrue);
      expect(tester.widget<SolarTextArea>(area).maxLength, isNull);
      _knob(state, 'footer', 'false');
      await tester.pump();
      expect(tester.widget<SolarTextArea>(area).charCount, isFalse);
      expect(tester.widget<SolarTextArea>(area).helper, isNull);
    },
  );

  testWidgets('SearchField: typing sets value; the search action is logged', (
    tester,
  ) async {
    final state = await _pump(tester, 'SearchField');
    final input = _input(find.byType(SolarSearchField));
    await tester.tap(input);
    await tester.enterText(input, 'invoices');
    await tester.pump();
    expect(knobsOf(state)['value'], 'invoices');
    await tester.testTextInput.receiveAction(TextInputAction.search);
    await tester.pump();
    expect(find.text('1. onSubmitted: "invoices"'), findsOneWidget);
    expect(
      tester.widget<SolarSearchField>(find.byType(SolarSearchField)).filter,
      isNotNull,
    );
    _knob(state, 'filter', '_none');
    await tester.pump();
    expect(
      tester.widget<SolarSearchField>(find.byType(SolarSearchField)).filter,
      isNull,
    );
  });

  testWidgets('GlobalSearch: a tap is logged; the query replaces the words', (
    tester,
  ) async {
    final state = await _pump(tester, 'GlobalSearch');
    expect(find.text('Search Workplace'), findsWidgets);
    await tester.tap(find.byType(SolarGlobalSearch));
    await tester.pump();
    expect(find.text('1. onPressed'), findsOneWidget);
    _knob(state, 'query', 'budget');
    _knob(state, 'shortcut', '');
    await tester.pump();
    final search = tester.widget<SolarGlobalSearch>(
      find.byType(SolarGlobalSearch),
    );
    expect(search.query, 'budget');
    expect(search.shortcut, isNull);
  });

  testWidgets('Password Input: typing sets value; the link is logged', (
    tester,
  ) async {
    final state = await _pump(tester, 'Password Input');
    final field = find.byType(SolarPasswordInput);
    expect(tester.widget<SolarPasswordInput>(field).label, 'Password');
    final input = _input(field);
    await tester.tap(input);
    await tester.enterText(input, 's3cret');
    await tester.pump();
    expect(knobsOf(state)['value'], 's3cret');
    await tester.tap(
      find.descendant(of: field, matching: find.text('Forgot password?')),
    );
    await tester.pump();
    expect(find.text('1. onForgotPassword'), findsOneWidget);
    _knob(state, 'label', 'false');
    await tester.pump();
    expect(tester.widget<SolarPasswordInput>(field).label, isNull);
  });

  testWidgets(
    'Number Input: typed and stepped within its range; value holds its words',
    (tester) async {
      final state = await _pump(tester, 'Number Input');
      final field = find.byType(SolarNumberInput);
      final input = _input(field);
      SolarNumberInput widget() => tester.widget<SolarNumberInput>(field);
      expect(widget().value, 1);
      await tester.tap(input);
      await tester.pump();
      await tester.enterText(input, '');
      await tester.pump();
      expect(knobsOf(state)['value'], '');
      expect(widget().value, isNull);
      await tester.enterText(input, '7.5');
      await tester.pump();
      expect(knobsOf(state)['value'], '7.5');
      expect(widget().value, 7.5);
      expect(find.text('1. onChanged: 7.5'), findsOneWidget);
      // The arrow keys step it, clamped to its max, 10, where Increase does nothing.
      for (var i = 0; i < 4; i++) {
        await tester.sendKeyEvent(LogicalKeyboardKey.arrowUp);
        await tester.pump();
      }
      expect(knobsOf(state)['value'], '10');
      expect(_controller(tester, input).text, '10');
      await tester.tap(find.bySemanticsLabel('Increase'));
      await tester.pump();
      expect(knobsOf(state)['value'], '10');
      await tester.tap(find.bySemanticsLabel('Decrease'));
      await tester.pump();
      expect(knobsOf(state)['value'], '9');
      // Words from the panel that are no number: an empty field.
      _knob(state, 'value', 'abc');
      await tester.pump();
      expect(widget().value, isNull);
      expect(_controller(tester, input).text, '');
    },
  );

  testWidgets(
    'Inline Input: a confirmed edit sets value and closes; a cancelled one does not',
    (tester) async {
      final state = await _pump(tester, 'Inline Input');
      final inline = find.byType(SolarInlineInput);
      await tester.tap(
        find.descendant(of: inline, matching: find.text('Current value')),
      );
      await tester.pump();
      final input = _input(inline);
      await tester.enterText(input, 'New value');
      // Enter confirms, and it stays closed.
      await tester.testTextInput.receiveAction(TextInputAction.done);
      await tester.pump();
      expect(knobsOf(state)['value'], 'New value');
      expect(find.text('1. onConfirm: "New value"'), findsOneWidget);
      expect(_input(inline), findsNothing);
      await tester.pump();
      expect(_input(inline), findsNothing);
      await tester.tap(
        find.descendant(of: inline, matching: find.text('New value')),
      );
      await tester.pump();
      await tester.enterText(_input(inline), 'Discarded');
      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pump();
      expect(knobsOf(state)['value'], 'New value');
      expect(find.text('1. onCancel'), findsOneWidget);
    },
  );

  testWidgets(
    'Token Input: the keyboard\'s action adds the draft; Backspace removes the last',
    (tester) async {
      final state = await _pump(tester, 'Token Input');
      final tokens = find.byType(SolarTokenInput);
      final input = _input(tokens);
      List<String> value() => tester.widget<SolarTokenInput>(tokens).value;
      expect(value(), ['Design', 'Research']);
      await tester.tap(input);
      await tester.pump();
      await tester.enterText(input, 'Opps');
      await tester.pump();
      tester.testTextInput.updateEditingValue(
        const TextEditingValue(
          text: 'Ops',
          selection: TextSelection.collapsed(offset: 2),
        ),
      );
      await tester.pump();
      expect(knobsOf(state)['draft'], 'Ops');
      expect(_controller(tester, input).selection.baseOffset, 2);
      await tester.testTextInput.receiveAction(TextInputAction.done);
      await tester.pump();
      expect(knobsOf(state)['tokens'], 'Design, Research, Ops');
      expect(knobsOf(state)['draft'], '');
      expect(value(), ['Design', 'Research', 'Ops']);
      expect(_controller(tester, input).text, '');
      expect(
        find.text('1. onChanged: ["Design","Research","Ops"]'),
        findsOneWidget,
      );
      // An entry with a comma in it is two, as the knob reads it; past maxVisible (3), a Counter
      // counts the rest.
      await tester.enterText(input, 'QA, Ops');
      await tester.testTextInput.receiveAction(TextInputAction.done);
      await tester.pump();
      expect(knobsOf(state)['tokens'], 'Design, Research, Ops, QA, Ops');
      expect(
        tester
            .widget<SolarCounter>(
              find.descendant(of: tokens, matching: find.byType(SolarCounter)),
            )
            .count,
        2,
      );
      // The keyboard's done action keeps the focus in the draft, so Backspace in it, empty, removes
      // the last entry with no second tap.
      expect(
        tester.state<EditableTextState>(input).widget.focusNode.hasFocus,
        isTrue,
      );
      await tester.sendKeyEvent(LogicalKeyboardKey.backspace);
      await tester.pump();
      expect(knobsOf(state)['tokens'], 'Design, Research, Ops, QA');
      // The draft from the panel.
      _knob(state, 'draft', 'from panel');
      await tester.pump();
      expect(_controller(tester, input).text, 'from panel');
      expect(knobsOf(state)['tokens'], 'Design, Research, Ops, QA');
    },
  );

  testWidgets(
    'PIN Input: typing fills it, digits only; the knob holds what the cells hold',
    (tester) async {
      final state = await _pump(tester, 'PIN Input');
      final pin = find.byType(SolarPINInput);
      final input = _input(pin);
      await tester.tap(pin);
      await tester.pump();
      await tester.enterText(input, '12a34');
      await tester.pump();
      expect(knobsOf(state)['value'], '1234');
      expect(_controller(tester, input).text, '1234');
      await tester.enterText(input, '12345678');
      await tester.pump();
      expect(knobsOf(state)['value'], '123456');
      expect(find.text('1. onCompleted: "123456"'), findsOneWidget);
      expect(find.text('2. onChanged: "123456"'), findsOneWidget);
      // A shorter code keeps its first digits, and the knob follows.
      _knob(state, 'length', '4');
      await tester.pump();
      await tester.pump();
      expect(tester.widget<SolarPINInput>(pin).length, 4);
      expect(_controller(tester, input).text, '1234');
      expect(knobsOf(state)['value'], '1234');
      // Words from the panel: their digits.
      _knob(state, 'value', '9x8');
      await tester.pump();
      await tester.pump();
      expect(_controller(tester, input).text, '98');
      expect(knobsOf(state)['value'], '98');
    },
  );

  testWidgets(
    'FileUpload: Browse is logged and chooses the sample; remove empties it',
    (tester) async {
      final state = await _pump(tester, 'FileUpload');
      await tester.tap(find.text('Browse'));
      await tester.pump();
      expect(find.text('1. onBrowse'), findsOneWidget);
      expect(knobsOf(state)['files'], 'Filename.jpg');
      expect(
        tester.widget<SolarFileUpload>(find.byType(SolarFileUpload)).value,
        ['Filename.jpg'],
      );
      await tester.tap(find.bySemanticsLabel('Remove file'));
      await tester.pump();
      expect(find.text('1. onRemove'), findsOneWidget);
      expect(knobsOf(state)['files'], '');
      _knob(state, 'files', 'a.png, b.png');
      await tester.pump();
      expect(
        tester.widget<SolarFileUpload>(find.byType(SolarFileUpload)).value,
        ['a.png', 'b.png'],
      );
    },
  );
}
