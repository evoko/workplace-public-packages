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

Finder layer(String name) => find.byKey(Key('statusIndicator.$name'));

void main() {
  group('SolarStatusIndicator', () {
    testWidgets('is decorative unless labelled, then an image with that name', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      await pump(tester, const SolarStatusIndicator());
      expect(find.bySemanticsLabel('Success'), findsNothing);
      await pump(tester, const SolarStatusIndicator(label: 'Success'));
      expect(
        tester.getSemantics(find.bySemanticsLabel('Success')),
        matchesSemantics(label: 'Success', isImage: true),
      );
      handle.dispose();
    });

    testWidgets('draws each type’s own layers, the mark where Figma put it', (
      tester,
    ) async {
      await pump(tester, const SolarStatusIndicator());
      expect(layer('innerPath'), findsOneWidget);
      expect(layer('union'), findsNothing);
      await pump(
        tester,
        const SolarStatusIndicator(type: SolarStatusIndicatorType.warning),
      );
      expect(layer('union'), findsOneWidget);
      final corner =
          tester.getTopLeft(layer('innerPath')) -
          tester.getTopLeft(layer('root'));
      expect(corner, const Offset(9, 6));
    });

    testWidgets('draws a glyph in the recipe’s colours, at its own size', (
      tester,
    ) async {
      await pump(
        tester,
        const SolarStatusIndicator(type: SolarStatusIndicatorType.danger),
      );
      final disc = tester.widget<SolarGlyphView>(
        find.descendant(
          of: layer('container'),
          matching: find.byType(SolarGlyphView),
        ),
      );
      expect(disc.fill, light.surfaceFeedbackDangerStrong);
      expect(disc.stroke, light.borderMedium);
      expect(tester.getSize(layer('root')), const Size(20, 20));
    });

    testWidgets('is a dot alone at xs', (tester) async {
      await pump(
        tester,
        const SolarStatusIndicator(size: SolarStatusIndicatorSize.xs),
      );
      expect(find.byType(SolarGlyphView), findsNothing);
      expect(tester.getSize(layer('root')), const Size(8, 8));
    });
  });
}
