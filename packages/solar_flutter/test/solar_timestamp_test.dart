import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

const light = SolarColors.light;

Future<void> pump(WidgetTester tester, Widget child) => tester.pumpWidget(
  MaterialApp(
    theme: ThemeData(extensions: const [SolarTheme.light]),
    home: Scaffold(body: Center(child: child)),
  ),
);

void main() {
  group('SolarTimestamp', () {
    testWidgets('draws the app’s words, quieter when subtle', (tester) async {
      await pump(tester, const SolarTimestamp(text: '2 min ago'));
      expect(
        tester.widget<Text>(find.text('2 min ago')).style!.color,
        light.textSecondary,
      );
      await pump(
        tester,
        const SolarTimestamp(
          text: '2 min ago',
          emphasis: SolarTimestampEmphasis.subtle,
        ),
      );
      expect(
        tester.widget<Text>(find.text('2 min ago')).style!.color,
        light.textTertiary,
      );
    });

    testWidgets('carries the absolute time as a tooltip, for combined', (
      tester,
    ) async {
      await pump(
        tester,
        const SolarTimestamp(
          format: SolarTimestampFormat.combined,
          text: '2 min ago',
          detail: 'Apr 18, 2026, 14:32',
        ),
      );
      expect(
        tester.widget<Tooltip>(find.byType(Tooltip)).message,
        'Apr 18, 2026, 14:32',
      );
    });
  });
}
