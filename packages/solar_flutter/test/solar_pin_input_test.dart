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
  group('SolarPINInput', () {
    testWidgets('fills a cell per digit typed, and is complete at its length', (
      tester,
    ) async {
      String? code;
      await pump(
        tester,
        SolarPINInput(label: 'Code', length: 4, onCompleted: (c) => code = c),
      );
      expect(find.byKey(const Key('pinInput.field5')), findsNothing);
      await tester.enterText(find.byType(TextField), '12a34');
      await tester.pump();
      expect(code, '1234');
      expect(find.text('4'), findsOneWidget);
    });

    testWidgets('shows the caret in the next cell while focused', (
      tester,
    ) async {
      await pump(tester, const SolarPINInput());
      expect(find.text('|'), findsNothing);
      await tester.tap(find.byKey(const Key('pinInput.cells')));
      await tester.pump();
      expect(find.text('|'), findsOneWidget);
    });

    testWidgets(
      'reads as one text field named by its label, its error in error',
      (tester) async {
        final handle = tester.ensureSemantics();
        await pump(
          tester,
          const SolarPINInput(
            label: 'Code',
            helper: 'Sent to you',
            errorMessage: 'Wrong code',
            error: true,
          ),
        );
        expect(find.text('Sent to you'), findsNothing);
        expect(
          tester.getSemantics(find.byType(TextField)),
          isSemantics(isTextField: true, label: 'Code', hint: 'Wrong code'),
        );
        handle.dispose();
      },
    );
  });
}
