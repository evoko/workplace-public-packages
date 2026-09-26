// The buttons' and display primitives' Playground builders driven through the real Widgetbook
// adapter, where a builder does more than pass its controls on: a toggle that sets its knob, a
// value written back, a menu, a sample context that gives a filling widget its size. That every
// builder renders at its defaults is playground_test.dart's.

import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';
import 'package:solar_widgetbook/playground/registry.dart';
import 'package:widgetbook/widgetbook.dart';

import 'helpers.dart';

Future<WidgetbookState> _pump(WidgetTester tester, String component) =>
    pumpPlayground(tester, component, playgroundBuilders[component]!);

void _knob(WidgetbookState state, String field, String value) =>
    state.updateQueryField(group: 'knobs', field: field, value: value);

void main() {
  testWidgets('Icon Button: a tap switches it on and off, and sets active', (
    tester,
  ) async {
    final state = await _pump(tester, 'Icon Button');
    final button = find.byType(SolarIconButton);
    expect(tester.widget<SolarIconButton>(button).active, isFalse);
    await tester.tap(button);
    await tester.pump();
    expect(knobsOf(state)['active'], 'true');
    expect(tester.widget<SolarIconButton>(button).active, isTrue);
    expect(find.text('1. onPressed'), findsOneWidget);
    await tester.tap(button);
    await tester.pump();
    expect(knobsOf(state)['active'], 'false');
    _knob(state, 'disabled', 'true');
    await tester.pump();
    expect(tester.widget<SolarIconButton>(button).onPressed, isNull);
  });

  testWidgets(
    'Button Group: its Buttons; a vertical group is written back regular',
    (tester) async {
      final state = await _pump(tester, 'Button Group');
      final group = find.byType(SolarButtonGroup);
      SolarButton buttonAt(int i) => tester.widget<SolarButton>(
        find.descendant(of: group, matching: find.byType(SolarButton)).at(i),
      );
      // The secondary and the primary, the primary last.
      expect(
        find.descendant(of: group, matching: find.byType(SolarButton)),
        findsNWidgets(2),
      );
      expect(buttonAt(1).prio, SolarButtonPrio.primary);
      _knob(state, 'tertiaryCTA', 'true');
      _knob(state, 'type', 'full-width');
      await tester.pump();
      expect(
        find.descendant(of: group, matching: find.byType(SolarButton)),
        findsNWidgets(3),
      );
      expect(buttonAt(0).size, SolarButtonSize.lg);
      await tester.tap(
        find.descendant(of: group, matching: find.byType(SolarButton)).at(2),
      );
      await tester.pump();
      expect(find.text('1. onPressed: "button3"'), findsOneWidget);
      // Figma draws no vertical full-width group: the builder writes the type back.
      _knob(state, 'orientation', 'vertical');
      await tester.pump();
      await tester.pump();
      expect(knobsOf(state)['type'], 'regular');
      final vertical = tester.widget<SolarButtonGroup>(group);
      expect(vertical.type, SolarButtonGroupType.regular);
      expect(buttonAt(0).prio, SolarButtonPrio.primary);
      expect(tester.takeException(), isNull);
    },
  );

  testWidgets('SplitButton: the chevron opens its menu; a variant is logged', (
    tester,
  ) async {
    await _pump(tester, 'SplitButton');
    await tester.tap(find.bySemanticsLabel('More options'));
    await tester.pumpAndSettle();
    expect(find.text('Option 2'), findsOneWidget);
    await tester.tap(find.text('Option 2'));
    await tester.pumpAndSettle();
    expect(find.text('Option 2'), findsNothing);
    expect(find.text('1. onSelected: "Option 2"'), findsOneWidget);
    expect(find.text('2. onMenuPressed'), findsOneWidget);
  });

  testWidgets(
    'Divider: drawn between two words, so it has a length; a vertical one is written back full',
    (tester) async {
      final state = await _pump(tester, 'Divider');
      final divider = find.byType(SolarDivider);
      expect(tester.getSize(divider).width, greaterThan(0));
      _knob(state, 'type', 'with-label');
      await tester.pump();
      expect(
        find.descendant(of: divider, matching: find.text('Or')),
        findsOneWidget,
      );
      // Figma draws a vertical divider full only: the builder writes the type back, and the rule
      // is as tall as the line and as thin as its border.
      _knob(state, 'orientation', 'vertical');
      await tester.pump();
      await tester.pump();
      expect(tester.takeException(), isNull);
      expect(knobsOf(state)['type'], 'full');
      expect(tester.widget<SolarDivider>(divider).type, SolarDividerType.full);
      expect(tester.getSize(divider).height, greaterThan(0));
      expect(
        tester.getSize(divider).width,
        lessThan(tester.getSize(divider).height),
      );
      _knob(state, 'type', 'inset');
      await tester.pump();
      await tester.pump();
      expect(tester.takeException(), isNull);
      expect(knobsOf(state)['type'], 'full');
    },
  );

  testWidgets('ProgressBar: the value in percent, under its number', (
    tester,
  ) async {
    final state = await _pump(tester, 'ProgressBar');
    final bar = find.byType(SolarProgressBar);
    expect(tester.widget<SolarProgressBar>(bar).value, 0.4);
    expect(find.text('40%'), findsOneWidget);
    expect(tester.getSize(bar).width, greaterThan(0));
    _knob(state, 'value', '75');
    await tester.pump();
    expect(tester.widget<SolarProgressBar>(bar).value, 0.75);
    expect(find.text('75%'), findsOneWidget);
  });

  testWidgets(
    'Avatar: a photo avatar shows the picture while picture is on, else initials',
    (tester) async {
      final state = await _pump(tester, 'Avatar');
      final avatar = find.byType(SolarAvatar);
      expect(
        find.descendant(of: avatar, matching: find.text('DS')),
        findsOneWidget,
      );
      _knob(state, 'initials', 'AB');
      await tester.pump();
      expect(
        find.descendant(of: avatar, matching: find.text('AB')),
        findsOneWidget,
      );
      _knob(state, 'type', 'photo');
      await tester.pump();
      expect(tester.widget<SolarAvatar>(avatar).image, isNotNull);
      expect(
        find.descendant(of: avatar, matching: find.text('AB')),
        findsNothing,
      );
      // With no picture, a photo avatar is drawn as the initials avatar.
      _knob(state, 'picture', 'false');
      await tester.pump();
      expect(tester.widget<SolarAvatar>(avatar).image, isNull);
      expect(
        find.descendant(of: avatar, matching: find.text('AB')),
        findsOneWidget,
      );
    },
  );
}
