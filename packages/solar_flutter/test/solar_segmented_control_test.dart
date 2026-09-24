import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

Future<void> pump(WidgetTester tester, Widget child) => tester.pumpWidget(
  MaterialApp(
    theme: ThemeData(extensions: const [SolarTheme.light]),
    home: Scaffold(body: Center(child: child)),
  ),
);

Widget control(String? value, ValueChanged<String?> onChanged) =>
    SolarSegmentedControl<String>(
      groupValue: value,
      onChanged: onChanged,
      label: 'Range',
      children: const [
        SolarSegmentedControlItem<String>(value: 'day', label: 'Day'),
        SolarSegmentedControlItem<String>(value: 'week', label: 'Week'),
      ],
    );

void main() {
  group('SolarSegmentedControl', () {
    testWidgets(
      'chooses the segment tapped, and announces each as one of a group',
      (tester) async {
        final handle = tester.ensureSemantics();
        String? asked;
        await pump(tester, control('week', (v) => asked = v));
        expect(
          tester.getSemantics(find.text('Week')),
          isSemantics(
            isInMutuallyExclusiveGroup: true,
            hasCheckedState: true,
            isChecked: true,
          ),
        );
        await tester.tap(find.text('Day'));
        expect(asked, 'day');
        handle.dispose();
      },
    );

    testWidgets('draws its label where given, and no helper where none is', (
      tester,
    ) async {
      await pump(tester, control('day', (_) {}));
      expect(find.text('Range'), findsOneWidget);
      expect(find.byKey(const Key('segmentedControl.helper')), findsNothing);
      expect(find.byKey(const Key('segmentedControl.mandatory')), findsNothing);
    });

    testWidgets('holds the segments in its track, the chosen one raised', (
      tester,
    ) async {
      await pump(tester, control('day', (_) {}));
      final track = find.byKey(const Key('segmentedControl.track'));
      expect(
        find.descendant(
          of: track,
          matching: find.byWidgetPredicate(
            (w) => w is SolarSegmentedControlItem,
          ),
        ),
        findsNWidgets(2),
      );
    });
  });
}
