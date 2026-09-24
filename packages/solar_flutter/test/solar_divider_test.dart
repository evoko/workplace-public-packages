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

Finder layer(String name) => find.byKey(Key('divider.$name'));

void main() {
  group('SolarDivider', () {
    testWidgets('fills the width it is given, a 1px rule', (tester) async {
      await pump(tester, const SizedBox(width: 200, child: SolarDivider()));
      expect(tester.getSize(layer('root')), const Size(200, 1));
      final rule = tester.widget<Container>(
        find.descendant(of: layer('rule'), matching: find.byType(Container)),
      );
      expect((rule.decoration! as BoxDecoration).color, light.borderSubtle);
    });

    testWidgets('draws a label between two rules', (tester) async {
      await pump(
        tester,
        const SizedBox(
          width: 200,
          child: SolarDivider(type: SolarDividerType.withLabel, label: 'Or'),
        ),
      );
      expect(find.text('Or'), findsOneWidget);
      expect(layer('rule2'), findsOneWidget);
    });
  });
}
