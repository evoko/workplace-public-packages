import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

Future<void> pump(WidgetTester tester, Widget child) => tester.pumpWidget(
  MaterialApp(
    theme: ThemeData(extensions: const [SolarTheme.light]),
    home: Scaffold(body: Center(child: child)),
  ),
);

const icon = SizedBox(key: Key('icon'), width: 20, height: 20);

/// The FAB's face, which the recipe sizes; the button around it pads its tap target to 48.
Finder face() => find
    .descendant(
      of: find.byType(FilledButton),
      matching: find.byType(DecoratedBox),
    )
    .first;

void main() {
  group('SolarFAB', () {
    testWidgets('is a 44px circle with an icon alone, a pill with a label', (
      tester,
    ) async {
      await pump(
        tester,
        SolarFAB(onPressed: () {}, icon: icon, semanticLabel: 'Add'),
      );
      expect(tester.getSize(face()), const Size(44, 44));
      await pump(
        tester,
        SolarFAB(onPressed: () {}, icon: icon, child: const Text('New')),
      );
      expect(tester.getSize(face()).width, greaterThan(44));
    });

    testWidgets('keeps its size while loading, the spinner in its place', (
      tester,
    ) async {
      await pump(
        tester,
        SolarFAB(onPressed: () {}, icon: icon, child: const Text('New')),
      );
      final resting = tester.getSize(face());
      await pump(
        tester,
        SolarFAB(
          onPressed: () {},
          icon: icon,
          loading: true,
          child: const Text('New'),
        ),
      );
      expect(tester.getSize(face()), resting);
      expect(find.byType(SolarSpinner), findsOneWidget);
    });

    test('an icon FAB needs a name', () {
      expect(
        () => SolarFAB(onPressed: () {}, icon: icon),
        throwsAssertionError,
      );
    });
  });
}
