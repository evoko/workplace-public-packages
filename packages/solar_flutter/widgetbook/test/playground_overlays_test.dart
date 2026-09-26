// The table, overlay and dialog Playground builders driven through the real Widgetbook adapter:
// selecting a row, hovering a tooltip's trigger, opening and closing a drawer and confirming a
// confirmation dialog change the widget, set their knobs and log the widget's callbacks. That every
// builder renders at its defaults, and every overlay opens and closes from its `open` knob, is
// playground_test.dart's.

import 'package:flutter/gestures.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';
import 'package:solar_widgetbook/playground/registry.dart';
import 'package:widgetbook/widgetbook.dart';

import 'helpers.dart';

Future<WidgetbookState> _pump(WidgetTester tester, String component) =>
    pumpPlayground(tester, component, playgroundBuilders[component]!);

/// The tooltip's bubble, floating over its trigger, holding [text].
Finder _bubble(String text) => find.descendant(
  of: find.byType(CompositedTransformFollower),
  matching: find.text(text),
);

void main() {
  setUpAll(loadBundledFonts);

  testWidgets('RowSelect: a tap selects its row and sets selected', (
    tester,
  ) async {
    final state = await _pump(tester, 'RowSelect');
    SolarRowSelect cell() => tester.widget(find.byType(SolarRowSelect));
    expect(cell().checked, isFalse);
    await tester.tap(
      find.descendant(
        of: find.byType(SolarRowSelect),
        matching: find.byType(SolarCheckbox),
      ),
    );
    await tester.pumpAndSettle();
    expect(knobsOf(state)['selected'], 'true');
    expect(cell().checked, isTrue);
    expect(find.text('1. onChanged: true'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets(
    'Tooltip: a hover shows it after its delay; open forces it; Escape clears it',
    (tester) async {
      final state = await _pump(tester, 'Tooltip');
      expect(_bubble('Label'), findsNothing);
      final mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
      await mouse.addPointer(location: Offset.zero);
      addTearDown(mouse.removePointer);
      await mouse.moveTo(tester.getCenter(find.text('Open')));
      await tester.pump(SolarMotion.durationSlow);
      await tester.pump();
      expect(_bubble('Label'), findsOneWidget);
      await mouse.moveTo(Offset.zero);
      await tester.pump();
      expect(_bubble('Label'), findsNothing);
      // The knob forces it, with no pointer on the trigger.
      state.updateQueryField(group: 'knobs', field: 'open', value: 'true');
      await settle(tester);
      expect(_bubble('Label'), findsOneWidget);
      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await settle(tester);
      expect(_bubble('Label'), findsNothing);
      expect(knobsOf(state)['open'], 'false');
      expect(tester.takeException(), isNull);
    },
  );

  testWidgets('Drawer: Open shows it; its close button hides it', (
    tester,
  ) async {
    final state = await _pump(tester, 'Drawer');
    expect(find.byType(SolarDrawer), findsNothing);
    await tester.tap(find.text('Open'));
    await settle(tester);
    expect(knobsOf(state)['open'], 'true');
    expect(find.byType(SolarDrawer), findsOneWidget);
    expect(
      tester.widget<SolarDrawer>(find.byType(SolarDrawer)).title,
      'Drawer Title',
    );
    await tester.tap(find.bySemanticsLabel('Close'));
    await settle(tester);
    expect(find.byType(SolarDrawer), findsNothing);
    expect(knobsOf(state)['open'], 'false');
    expect(find.text('1. onClose'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets(
    'ConfirmationDialog: Continue confirms, logs onConfirm and closes it',
    (tester) async {
      final state = await _pump(tester, 'ConfirmationDialog');
      await tester.tap(find.text('Open'));
      await settle(tester);
      expect(find.byType(SolarConfirmationDialog), findsOneWidget);
      await tester.tap(find.text('Continue'));
      await settle(tester);
      expect(find.byType(SolarConfirmationDialog), findsNothing);
      expect(knobsOf(state)['open'], 'false');
      expect(find.text('1. onConfirm'), findsOneWidget);
      // Cancelled by Escape, it logs the widget's cancel, as the web's shell calls it.
      await tester.tap(find.text('Open'));
      await settle(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await settle(tester);
      expect(find.byType(SolarConfirmationDialog), findsNothing);
      expect(find.text('1. onCancel'), findsOneWidget);
      expect(tester.takeException(), isNull);
    },
  );
}
