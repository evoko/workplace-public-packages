import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

Future<void> pump(WidgetTester tester, Widget child) => tester.pumpWidget(
  MaterialApp(
    theme: ThemeData(extensions: const [SolarTheme.light]),
    home: Scaffold(
      body: Center(child: SizedBox(width: 240, child: child)),
    ),
  ),
);

void main() {
  group('SolarSearchField', () {
    testWidgets('reads as a text field named Search, and searches on submit', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      String? asked;
      await pump(tester, SolarSearchField(onSubmitted: (q) => asked = q));
      expect(
        tester.getSemantics(find.byType(TextField)),
        isSemantics(isTextField: true, label: 'Search'),
      );
      await tester.enterText(find.byType(TextField), 'desk');
      await tester.testTextInput.receiveAction(TextInputAction.search);
      expect(asked, 'desk');
      handle.dispose();
    });

    testWidgets('focuses its query on a tap by its search icon', (
      tester,
    ) async {
      await pump(tester, const SolarSearchField());
      await tester.tap(find.byKey(const Key('searchField.iconSearch')));
      await tester.pump();
      expect(tester.testTextInput.hasAnyClients, true);
    });

    testWidgets('draws the caller’s filter only where given', (tester) async {
      await pump(tester, const SolarSearchField());
      expect(find.byKey(const Key('searchField.filter')), findsNothing);
      await pump(tester, const SolarSearchField(filter: Icon(Icons.tune)));
      expect(find.byKey(const Key('searchField.filter')), findsOneWidget);
    });
  });
}
