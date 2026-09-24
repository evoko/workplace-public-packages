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
  group('SolarProgressBar', () {
    testWidgets('draws the track and the feedback’s bar at its value', (
      tester,
    ) async {
      await pump(
        tester,
        const SizedBox(
          width: 200,
          child: SolarProgressBar(
            value: 0.4,
            feedback: SolarProgressBarFeedback.danger,
          ),
        ),
      );
      final bar = tester.widget<LinearProgressIndicator>(
        find.byType(LinearProgressIndicator),
      );
      expect(bar.value, 0.4);
      expect(bar.backgroundColor, light.surfaceMuted);
      expect(bar.color, light.surfaceFeedbackDangerStrong);
      expect(
        tester.getSize(find.byType(LinearProgressIndicator)),
        const Size(200, 6),
      );
    });
  });
}
