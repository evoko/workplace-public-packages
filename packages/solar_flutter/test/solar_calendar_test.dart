import 'dart:ui' show Tristate;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

Future<void> pump(WidgetTester tester, Widget child) => tester.pumpWidget(
  MaterialApp(
    theme: ThemeData(extensions: const [SolarTheme.light]),
    home: Scaffold(
      body: Center(child: SizedBox(width: 1280, child: child)),
    ),
  ),
);

void main() {
  testWidgets(
    'SolarEventChip draws its time and repeat icon only where given',
    (tester) async {
      final handle = tester.ensureSemantics();
      await pump(tester, const SolarEventChip(title: 'Standup'));
      expect(find.text('9:00'), findsNothing);
      expect(find.bySemanticsLabel('Repeats'), findsNothing);
      await pump(
        tester,
        const SolarEventChip(title: 'Standup', time: '9:00', repeating: true),
      );
      expect(find.text('9:00'), findsOneWidget);
      expect(find.bySemanticsLabel('Repeats'), findsOneWidget);
      handle.dispose();
    },
  );

  testWidgets('SolarCalendarDayCell names its date, says it is selected', (
    tester,
  ) async {
    final handle = tester.ensureSemantics();
    await pump(
      tester,
      const SizedBox(
        width: 160,
        // One figure: the test font draws each glyph a full em wide, and a pill holds two only in
        // SOLAR's font, which the visual checks load.
        child: SolarCalendarDayCell(
          day: '5',
          selected: true,
          semanticLabel: 'Friday 5 September',
          children: [SolarEventChip(title: 'Standup')],
        ),
      ),
    );
    final cell = tester.getSemantics(find.byType(SolarCalendarDayCell));
    expect(cell.getSemanticsData().flagsCollection.isSelected, Tristate.isTrue);
    // Its date first, then its events.
    expect(cell.label, startsWith('Friday 5 September'));
    expect(find.text('Standup'), findsOneWidget);
    handle.dispose();
  });

  testWidgets('SolarTimeSlot is pressable, its half-hour rule dashed', (
    tester,
  ) async {
    var pressed = 0;
    await pump(
      tester,
      SizedBox(width: 160, child: SolarTimeSlot(onPressed: () => pressed++)),
    );
    await tester.tap(find.byType(SolarTimeSlot));
    expect(pressed, 1);
    final rule = tester.widget<Container>(
      find.descendant(
        of: find.byKey(const Key('timeSlot.halfHourRule')),
        matching: find.byType(Container),
      ),
    );
    final dashed = rule.foregroundDecoration! as SolarDashedDecoration;
    expect(dashed.dash, [2, 4]);
    // Along the slot's whole width, from its outer edge as Figma places it, as it fills its column.
    expect(
      tester.getSize(find.byKey(const Key('timeSlot.halfHourRule'))).width,
      tester.getSize(find.byType(SolarTimeSlot)).width,
    );
  });

  testWidgets('SolarAgendaRow joins a compact range, and presses', (
    tester,
  ) async {
    var pressed = 0;
    await pump(
      tester,
      SolarAgendaRow(
        title: 'Standup',
        start: '9:00',
        end: '10:00',
        density: SolarAgendaRowDensity.compact,
        onPressed: () => pressed++,
      ),
    );
    expect(find.text('9:00 – 10:00'), findsOneWidget);
    await tester.tap(find.text('Standup'));
    expect(pressed, 1);
  });

  testWidgets('SolarCalendarToolbar calls the caller from its own buttons', (
    tester,
  ) async {
    final calls = <String>[];
    final handle = tester.ensureSemantics();
    await pump(
      tester,
      SolarCalendarToolbar(
        range: 'October 5 – 11, 2026',
        onPrevious: () => calls.add('previous'),
        onNext: () => calls.add('next'),
        onToday: () => calls.add('today'),
      ),
    );
    await tester.tap(find.bySemanticsLabel('Previous'));
    await tester.tap(find.bySemanticsLabel('Next'));
    await tester.tap(find.text('Today'));
    expect(calls, ['previous', 'next', 'today']);
    handle.dispose();
  });
}
