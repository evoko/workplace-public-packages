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

Finder layer(String name) => find.byKey(Key('kbd.$name'));

void main() {
  group('SolarKbd', () {
    testWidgets('draws its label in the recipe’s text colour, on its cap', (
      tester,
    ) async {
      await pump(tester, const SolarKbd(label: 'Ctrl'));
      expect(find.text('Ctrl'), findsOneWidget);
      final text = tester.widget<Text>(find.text('Ctrl'));
      expect(text.style!.color, light.textInverse);
      final cap = tester.widget<Container>(
        find.descendant(of: layer('root'), matching: find.byType(Container)),
      );
      expect(
        (cap.decoration! as BoxDecoration).color,
        light.surfaceFeedbackNeutralStrong,
      );
    });

    testWidgets('takes the top-search cap’s fill', (tester) async {
      await pump(
        tester,
        const SolarKbd(type: SolarKbdType.topSearch, label: 'K'),
      );
      final cap = tester.widget<Container>(
        find.descendant(of: layer('root'), matching: find.byType(Container)),
      );
      expect(
        (cap.decoration! as BoxDecoration).color,
        light.surfaceFeedbackNeutralMedium,
      );
    });
  });
}
