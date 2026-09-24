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
  group('SolarCursor', () {
    testWidgets(
      'draws the arrow at its own size, outlined for light and dark',
      (tester) async {
        await pump(tester, const SolarCursor());
        expect(
          tester.getSize(find.byKey(const Key('cursor.root'))),
          const Size(12, 14),
        );
        final arrow = tester.widget<SolarGlyphView>(
          find.byType(SolarGlyphView),
        );
        expect(arrow.fill, light.iconPrimary);
        expect(arrow.stroke, light.iconInverse);
      },
    );
  });
}
