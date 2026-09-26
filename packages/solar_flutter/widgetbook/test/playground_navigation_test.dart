// The navigation, paging and card Playground builders driven through the real Widgetbook adapter:
// choosing a tab, expanding, stepping, selecting and going back along a trail set their knobs, and a
// card's More menu opens and logs its choice with the widget's callback's name. That every builder
// renders at its defaults is playground_test.dart's.

import 'package:flutter/gestures.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';
import 'package:solar_widgetbook/playground/registry.dart';
import 'package:widgetbook/widgetbook.dart';

import 'helpers.dart';

Future<WidgetbookState> _pump(WidgetTester tester, String component) =>
    pumpPlayground(tester, component, playgroundBuilders[component]!);

/// [text] in the widget [of] finds, not in a knob's field in the panel.
Finder _in(Finder of, String text) =>
    find.descendant(of: of, matching: find.text(text));

void main() {
  testWidgets('Tabs: choosing another tab selects it and sets selected', (
    tester,
  ) async {
    final state = await _pump(tester, 'Tabs');
    SolarTabs tabs() => tester.widget(find.byType(SolarTabs));
    expect(knobsOf(state)['selected'] ?? 'Overview', 'Overview');
    await tester.tap(_in(find.byType(SolarTabs), 'Activity'));
    await tester.pumpAndSettle();
    expect(knobsOf(state)['selected'], 'Activity');
    expect(tabs().value.toString(), contains('activity'));
    expect(find.text('1. onChanged: "Activity"'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets(
    'Accordion: its header expands and collapses it, and sets expanded',
    (tester) async {
      final state = await _pump(tester, 'Accordion');
      SolarAccordion accordion() => tester.widget(find.byType(SolarAccordion));
      expect(accordion().expanded, isFalse);
      await tester.tap(_in(find.byType(SolarAccordion), 'Label'));
      await tester.pumpAndSettle();
      expect(knobsOf(state)['expanded'], 'true');
      expect(accordion().expanded, isTrue);
      expect(find.text('1. onExpandedChanged: true'), findsOneWidget);
      await tester.tap(_in(find.byType(SolarAccordion), 'Label'));
      await tester.pumpAndSettle();
      expect(knobsOf(state)['expanded'], 'false');
      expect(find.text('1. onExpandedChanged: false'), findsOneWidget);
      expect(tester.takeException(), isNull);
    },
  );

  testWidgets(
    'Stepper: Next moves it on; a completed step goes back; both set activeStep',
    (tester) async {
      final state = await _pump(tester, 'Stepper');
      SolarStepper stepper() => tester.widget(find.byType(SolarStepper));
      expect(stepper().activeStep, 1);
      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle();
      expect(knobsOf(state)['activeStep'], '2');
      expect(stepper().activeStep, 2);
      expect(find.text('1. onPressed: "Next"'), findsOneWidget);
      // The first step is complete: pressable, back to it.
      await tester.tap(_in(find.byType(SolarStepper), 'Account'));
      await tester.pumpAndSettle();
      expect(knobsOf(state)['activeStep'], '0');
      expect(stepper().activeStep, 0);
      expect(find.text('1. onStepClick: 0'), findsOneWidget);
      expect(tester.takeException(), isNull);
    },
  );

  testWidgets('Image Card: its Checkbox selects it and sets selected', (
    tester,
  ) async {
    final state = await _pump(tester, 'Image Card');
    // The Checkbox shows while the pointer is on the tile, as Figma draws it hovered.
    final mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
    await mouse.addPointer(
      location: tester.getCenter(find.byType(SolarImageCard)),
    );
    addTearDown(mouse.removePointer);
    await tester.pumpAndSettle();
    await tester.tap(
      find.descendant(
        of: find.byType(SolarImageCard),
        matching: find.byType(SolarCheckbox),
      ),
    );
    await tester.pumpAndSettle();
    expect(knobsOf(state)['selected'], 'true');
    expect(
      tester.widget<SolarImageCard>(find.byType(SolarImageCard)).selected,
      isTrue,
    );
    expect(find.text('1. onSelectedChanged: true'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('Card: its More menu opens, and choosing an action logs it', (
    tester,
  ) async {
    await _pump(tester, 'Card');
    expect(find.text('Duplicate'), findsNothing);
    await tester.tap(find.bySemanticsLabel('More actions'));
    // Its content's Skeleton pulses, so it never settles.
    await settle(tester);
    expect(find.text('Duplicate'), findsOneWidget);
    await tester.tap(find.text('Duplicate'));
    await settle(tester);
    expect(find.text('Duplicate'), findsNothing);
    expect(find.text('1. onSelected: "Duplicate"'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets(
    'Breadcrumbs: choosing a page ends the trail at it, and sets items',
    (tester) async {
      final state = await _pump(tester, 'Breadcrumbs');
      final trail = find.byType(SolarBreadcrumbs);
      expect(_in(trail, 'Building A'), findsOneWidget);
      await tester.tap(_in(trail, 'Spaces'));
      await tester.pumpAndSettle();
      expect(knobsOf(state)['items'], '2');
      expect(_in(trail, 'Building A'), findsNothing);
      expect(find.text('1. onPressed: "Spaces"'), findsOneWidget);
      expect(tester.takeException(), isNull);
    },
  );
}
