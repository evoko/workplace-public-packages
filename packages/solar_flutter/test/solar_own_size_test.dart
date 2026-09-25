// A drawn widget keeps its own size where its parent stretches it (SolarOwnSize), and is pressed
// where it is drawn: in a ListView, a Checkbox is 16px, a tap within its 44 × 44 target presses
// it, and a tap across the row does not.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

Future<void> pumpInList(WidgetTester tester, Widget child) => tester.pumpWidget(
  MaterialApp(
    theme: ThemeData(extensions: [SolarTheme.light]),
    home: Scaffold(body: ListView(children: [child])),
  ),
);

void main() {
  testWidgets('a Checkbox in a ListView is its own size, at the row’s start', (
    tester,
  ) async {
    await pumpInList(tester, SolarCheckbox(onChanged: (_) {}));
    final drawn = tester.getRect(find.byKey(const ValueKey('checkbox.root')));
    expect(drawn.size, const Size(16, 16));
    final row = tester.getRect(find.byType(SolarOwnSize));
    expect(drawn.left, moreOrLessEquals(row.left, epsilon: 15));
  });

  testWidgets('at the row’s end in a right-to-left app', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: ThemeData(extensions: [SolarTheme.light]),
        home: Directionality(
          textDirection: TextDirection.rtl,
          child: Scaffold(
            body: ListView(children: [SolarCheckbox(onChanged: (_) {})]),
          ),
        ),
      ),
    );
    final drawn = tester.getRect(find.byKey(const ValueKey('checkbox.root')));
    final row = tester.getRect(find.byType(SolarOwnSize));
    expect(drawn.right, moreOrLessEquals(row.right, epsilon: 15));
  });

  testWidgets('a Button and an Icon Button keep Figma’s size in a ListView', (
    tester,
  ) async {
    await pumpInList(
      tester,
      Column(
        children: [
          SolarButton(onPressed: () {}, child: const Text('Continue')),
          SolarIconButton(
            onPressed: () {},
            icon: const SolarIcon(SolarIcons.plusOutline),
            semanticLabel: 'Add',
          ),
        ],
      ),
    );
    expect(
      tester.getSize(find.byType(FilledButton).first).width,
      lessThan(200),
    );
    expect(tester.getSize(find.byType(SolarIconButton)).width, lessThan(100));
  });

  testWidgets('a Button Group still shares its row between its buttons', (
    tester,
  ) async {
    await pumpInList(
      tester,
      SizedBox(
        width: 400,
        child: SolarButtonGroup(
          children: [
            SolarButton(onPressed: () {}, child: const Text('One')),
            SolarButton(onPressed: () {}, child: const Text('Two')),
          ],
        ),
      ),
    );
    final widths = tester
        .widgetList<FilledButton>(find.byType(FilledButton))
        .map((b) => tester.getSize(find.byWidget(b)).width)
        .toList();
    expect(widths.first, moreOrLessEquals(widths.last));
    expect(widths.first, greaterThan(150));
  });

  testWidgets(
    'a tap within its target presses it, and one across the row does not',
    (tester) async {
      var taps = 0;
      await pumpInList(tester, SolarCheckbox(onChanged: (_) => taps++));
      final drawn = tester.getRect(find.byKey(const ValueKey('checkbox.root')));
      await tester.tapAt(drawn.center + const Offset(18, 0));
      expect(taps, 1, reason: '18px from its centre is within 44 × 44');
      await tester.tapAt(drawn.center + const Offset(200, 0));
      expect(taps, 1, reason: 'the row beside it is not the checkbox');
    },
  );

  testWidgets('a Tag in a ListView hugs its words', (tester) async {
    await pumpInList(tester, const SolarTag(label: 'Label'));
    final drawn = tester.getRect(find.byKey(const ValueKey('tag.root')));
    expect(drawn.width, lessThan(100));
  });

  testWidgets('a Card that fills its width spans the ListView', (tester) async {
    await pumpInList(tester, const SolarCard(title: 'Label'));
    final list = tester.getRect(find.byType(ListView));
    final drawn = tester.getRect(find.byKey(const ValueKey('card.root')));
    expect(drawn.width, moreOrLessEquals(list.width));
  });
}
