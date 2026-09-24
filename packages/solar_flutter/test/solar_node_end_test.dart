import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

Future<void> pump(WidgetTester tester, Widget child) => tester.pumpWidget(
  MaterialApp(
    theme: ThemeData(extensions: const [SolarTheme.light]),
    home: Scaffold(body: Center(child: child)),
  ),
);

Finder layer(String name) => find.byKey(Key('nodeEnd.$name'));

void main() {
  group('SolarNodeEnd', () {
    testWidgets(
      'draws the halo translucent around the dot, where Figma put it',
      (tester) async {
        await pump(tester, const SolarNodeEnd(halo: true));
        expect(tester.getSize(layer('halo')), const Size(14, 14));
        expect(
          tester.getTopLeft(layer('halo')) - tester.getTopLeft(layer('root')),
          const Offset(-1, -1),
        );
        expect(
          tester
              .widget<Opacity>(
                find.descendant(
                  of: layer('halo'),
                  matching: find.byType(Opacity),
                ),
              )
              .opacity,
          0.2,
        );
      },
    );

    testWidgets('is decorative', (tester) async {
      final handle = tester.ensureSemantics();
      await pump(tester, const SolarNodeEnd());
      expect(find.byType(ExcludeSemantics), findsWidgets);
      handle.dispose();
    });
  });
}
