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
  group('SolarBackButton', () {
    testWidgets('says Back by default, with SOLAR’s arrow', (tester) async {
      await pump(tester, SolarBackButton(onPressed: () {}));
      expect(find.text('Back'), findsOneWidget);
      expect(
        tester.widget<SolarIcon>(find.byType(SolarIcon)).icon,
        SolarIcons.arrowLeftOutline,
      );
    });

    testWidgets('names the arrow alone Back', (tester) async {
      final handle = tester.ensureSemantics();
      await pump(tester, SolarBackButton(onPressed: () {}, child: null));
      expect(find.text('Back'), findsNothing);
      expect(find.bySemanticsLabel('Back'), findsOneWidget);
      handle.dispose();
    });
  });
}
