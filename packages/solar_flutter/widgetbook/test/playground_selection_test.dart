// The selection controls' and messages' Playground builders driven through the real Widgetbook
// adapter, where a builder does more than pass its controls on: a radio in its group, a toggle and
// a slider that set their knobs (by tap, drag and the arrow keys), a segment in its control, a tag's
// and a banner's close buttons. That every builder renders at its defaults is playground_test.dart's.

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

/// A widget of a generic type whatever its type argument (a builder's private enum).
Finder _any<T>() => find.byWidgetPredicate((w) => w is T);

void main() {
  testWidgets(
    'Radio: in a group of three; a tap chooses one and sets selected',
    (tester) async {
      final state = await _pump(tester, 'Radio');
      Object? chosen() =>
          (tester.widget(_any<RadioGroup>()) as RadioGroup).groupValue;
      expect(_any<SolarRadio>(), findsNWidgets(3));
      expect((chosen()! as Enum).index, 0);
      await tester.tap(_any<SolarRadio>().at(1));
      await tester.pump();
      expect(knobsOf(state)['selected'], 'Option 2');
      expect((chosen()! as Enum).index, 1);
      expect(find.text('1. onChanged: "Option 2"'), findsOneWidget);
      // `checked` off: the group holds no choice; a tap chooses again, and turns it back on.
      _knob(state, 'checked', 'false');
      await tester.pump();
      expect(chosen(), isNull);
      await tester.tap(_any<SolarRadio>().at(2));
      await tester.pump();
      expect(knobsOf(state)['checked'], 'true');
      expect(knobsOf(state)['selected'], 'Option 3');
      // Disabled, every radio is inert.
      _knob(state, 'disabled', 'true');
      await tester.pump();
      await tester.tap(_any<SolarRadio>().at(0));
      await tester.pump();
      expect(knobsOf(state)['selected'], 'Option 3');
    },
  );

  testWidgets('Toggle: a tap turns it on and sets selected', (tester) async {
    final state = await _pump(tester, 'Toggle');
    final toggle = find.byType(SolarToggle);
    expect(tester.widget<SolarToggle>(toggle).selected, isFalse);
    await tester.tap(toggle);
    await tester.pump();
    expect(knobsOf(state)['selected'], 'true');
    expect(tester.widget<SolarToggle>(toggle).selected, isTrue);
    expect(find.text('1. onChanged: true'), findsOneWidget);
    _knob(state, 'disabled', 'true');
    await tester.pump();
    expect(tester.widget<SolarToggle>(toggle).onChanged, isNull);
  });

  testWidgets('Slider: the arrow keys and a drag set value, in percent', (
    tester,
  ) async {
    final state = await _pump(tester, 'Slider');
    final slider = find.byType(SolarSlider);
    expect(tester.widget<SolarSlider>(slider).value, 0.5);
    // It fills the width box.
    expect(tester.getSize(slider).width, greaterThan(100));
    tester
        .widget<FocusableActionDetector>(
          find.descendant(
            of: slider,
            matching: find.byType(FocusableActionDetector),
          ),
        )
        .focusNode!
        .requestFocus();
    await tester.pump();
    await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
    await tester.pump();
    expect(knobsOf(state)['value'], '60');
    expect(tester.widget<SolarSlider>(slider).value, 0.6);
    expect(find.text('1. onChanged: 60'), findsOneWidget);
    // Focused still, across the rebuild the write made.
    await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
    await tester.pump();
    expect(knobsOf(state)['value'], '70');
    // A drag to the start, in steps, through the rebuild every step's write makes.
    final gesture = await tester.startGesture(tester.getCenter(slider));
    await tester.pump();
    for (var i = 0; i < 10; i++) {
      await gesture.moveBy(Offset(-tester.getSize(slider).width / 10, 0));
      await tester.pump();
    }
    await gesture.up();
    await tester.pump();
    expect(knobsOf(state)['value'], '0');
    expect(tester.widget<SolarSlider>(slider).value, 0);
    expect(find.textContaining('onChangeEnd: 0'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('Slider Range: drawn low to high; a drag sets low and high', (
    tester,
  ) async {
    final state = await _pump(tester, 'Slider Range');
    final range = find.byType(SolarSliderRange);
    expect(
      tester.widget<SolarSliderRange>(range).values,
      const RangeValues(0.2, 0.8),
    );
    _knob(state, 'low', '90');
    await tester.pump();
    expect(
      tester.widget<SolarSliderRange>(range).values,
      const RangeValues(0.8, 0.9),
    );
    _knob(state, 'low', '20');
    await tester.pump();
    // A drag from the right end takes the high handle.
    final box = tester.getRect(range);
    await tester.dragFrom(
      Offset(box.left + box.width * 0.8, box.center.dy),
      Offset(box.width * 0.1, 0),
    );
    await tester.pump();
    expect(knobsOf(state)['low'], '20');
    expect(int.parse(knobsOf(state)['high']!), greaterThan(80));
    expect(tester.takeException(), isNull);
  });

  testWidgets('Segmented Control: a tap chooses a segment and sets selected', (
    tester,
  ) async {
    final state = await _pump(tester, 'Segmented Control');
    await tester.tap(
      find.descendant(
        of: _any<SolarSegmentedControl>(),
        matching: find.text('Week'),
      ),
    );
    await tester.pump();
    expect(knobsOf(state)['selected'], 'Week');
    expect(find.text('1. onChanged: "Week"'), findsOneWidget);
    _knob(state, 'track', 'false');
    await tester.pump();
    expect(_any<SolarSegmentedControlItem>(), findsNothing);
  });

  testWidgets(
    'Segmented Control Item: first of three; choosing it or a sibling sets selected',
    (tester) async {
      final state = await _pump(tester, 'Segmented Control Item');
      Finder segment(String words) => find.descendant(
        of: _any<SolarSegmentedControl>(),
        matching: find.text(words),
      );
      Object? chosen() => (tester.widget(
        _any<SolarSegmentedControl>(),
      ) as SolarSegmentedControl).groupValue;
      expect(chosen(), 'Day');
      await tester.tap(segment('Month'));
      await tester.pump();
      expect(knobsOf(state)['selected'], 'false');
      expect(chosen(), 'Month');
      await tester.tap(segment('Day'));
      await tester.pump();
      expect(knobsOf(state)['selected'], 'true');
      // Off from the panel: the sibling chosen last.
      _knob(state, 'selected', 'false');
      await tester.pump();
      expect(chosen(), 'Month');
      _knob(state, 'label', 'Today');
      await tester.pump();
      expect(segment('Today'), findsOneWidget);
    },
  );

  testWidgets('Tag: closable logs its close; no dot on an inverted tag', (
    tester,
  ) async {
    final state = await _pump(tester, 'Tag');
    final tag = find.byType(SolarTag);
    expect(tester.widget<SolarTag>(tag).onClose, isNull);
    _knob(state, 'closable', 'true');
    await tester.pump();
    await tester.tap(find.bySemanticsLabel(RegExp('^Remove')));
    await tester.pump();
    expect(find.text('1. onClose'), findsOneWidget);
    _knob(state, 'indicator', 'true');
    await tester.pump();
    expect(tester.widget<SolarTag>(tag).indicator, isTrue);
    _knob(state, 'invert', 'true');
    await tester.pump();
    expect(tester.widget<SolarTag>(tag).indicator, isFalse);
    expect(tester.takeException(), isNull);
  });

  testWidgets('Banner: its Buttons and close button are logged', (
    tester,
  ) async {
    final state = await _pump(tester, 'Banner');
    final banner = find.byType(SolarBanner);
    expect(tester.widget<SolarBanner>(banner).primaryButton, isNull);
    _knob(state, 'primaryButton', 'true');
    await tester.pump();
    await tester.tap(
      find.descendant(of: banner, matching: find.byType(SolarButton)),
    );
    await tester.pump();
    expect(find.text('1. onPressed: "primaryButton"'), findsOneWidget);
    await tester.tap(find.bySemanticsLabel('Dismiss'));
    await tester.pump();
    expect(find.text('1. onClose'), findsOneWidget);
    _knob(state, 'close', '_none');
    await tester.pump();
    expect(tester.widget<SolarBanner>(banner).onClose, isNull);
  });

  testWidgets('Toast: its Tag and chevron follow their controls', (
    tester,
  ) async {
    final state = await _pump(tester, 'Toast');
    final toast = find.byType(SolarToast);
    expect(tester.widget<SolarToast>(toast).tag, 'Upload');
    expect(tester.widget<SolarToast>(toast).chevron, isTrue);
    expect(
      find.descendant(of: toast, matching: find.text('File saved')),
      findsOneWidget,
    );
    _knob(state, 'tag', 'false');
    _knob(state, 'chevron', '_none');
    await tester.pump();
    expect(tester.widget<SolarToast>(toast).tag, isNull);
    expect(tester.widget<SolarToast>(toast).chevron, isFalse);
    await tester.tap(find.descendant(of: toast, matching: find.text('Undo')));
    await tester.pump();
    expect(find.text('1. onAction'), findsOneWidget);
  });
}
