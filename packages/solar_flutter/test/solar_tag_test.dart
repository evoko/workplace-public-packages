import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

Future<void> pump(WidgetTester tester, Widget child) => tester.pumpWidget(
  MaterialApp(
    theme: ThemeData(extensions: const [SolarTheme.light]),
    home: Scaffold(body: Center(child: child)),
  ),
);

void main() {
  group('SolarTag', () {
    testWidgets(
      'draws the status dot, a StatusIndicator, where indicator is set',
      (tester) async {
        await pump(
          tester,
          const SolarTag(
            status: SolarTagStatus.info,
            label: 'Active',
            indicator: true,
          ),
        );
        expect(find.byType(SolarStatusIndicator), findsOneWidget);
        await pump(tester, const SolarTag(label: 'Active'));
        expect(find.byType(SolarStatusIndicator), findsNothing);
      },
    );

    testWidgets(
      'draws a close button, named with its words, that calls onClose',
      (tester) async {
        final handle = tester.ensureSemantics();
        var closed = 0;
        await pump(tester, SolarTag(label: 'Room A', onClose: () => closed++));
        expect(find.bySemanticsLabel('Remove Room A'), findsOneWidget);
        await tester.tap(find.byKey(const Key('tag.iconClose')));
        expect(closed, 1);
        handle.dispose();
      },
    );

    testWidgets(
      'refuses an inverted tag with a dot, which Figma does not draw',
      (tester) async {
        await pump(
          tester,
          const SolarTag(label: 'Active', invert: true, indicator: true),
        );
        expect(tester.takeException(), isAssertionError);
      },
    );
  });
}
