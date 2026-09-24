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
  group('SolarRowExpand', () {
    testWidgets('draws the chevron as a SOLAR icon when collapsed', (
      tester,
    ) async {
      await pump(
        tester,
        const SolarRowExpand(type: SolarRowExpandType.collapsed),
      );
      final icon = tester.widget<SolarIcon>(find.byType(SolarIcon));
      expect(icon.icon, SolarIcons.chevronRightOutline);
      expect(icon.color, light.iconPrimary);
      expect(icon.size, 16);
    });

    testWidgets('draws a connector beside a child row', (tester) async {
      await pump(
        tester,
        const SolarRowExpand(type: SolarRowExpandType.middleRow),
      );
      expect(find.byType(SolarIcon), findsNothing);
      expect(find.byType(SolarGlyphView), findsNWidgets(2));
    });
  });
}
