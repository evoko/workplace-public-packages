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
  group('SolarTrendBadge', () {
    testWidgets('is decorative unless labelled, then an image with that name', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      await pump(tester, const SolarTrendBadge(label: 'Up 12%'));
      expect(
        tester.getSemantics(find.bySemanticsLabel('Up 12%')),
        matchesSemantics(label: 'Up 12%', isImage: true),
      );
      handle.dispose();
    });

    testWidgets('draws its arrow in the icon colour, and a dot alone at xs', (
      tester,
    ) async {
      await pump(tester, const SolarTrendBadge());
      final arrow = tester.widget<SolarGlyphView>(find.byType(SolarGlyphView));
      expect(arrow.fill, light.iconInverse);
      await pump(tester, const SolarTrendBadge(size: SolarTrendBadgeSize.xs));
      expect(find.byType(SolarGlyphView), findsNothing);
      expect(
        tester.getSize(find.byKey(const Key('trendBadge.root'))),
        const Size(8, 8),
      );
    });
  });
}
