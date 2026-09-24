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
  group('SolarGlobalSearch', () {
    testWidgets(
      'is a button named by its words, which opens the app’s search',
      (tester) async {
        final handle = tester.ensureSemantics();
        var opened = 0;
        await pump(
          tester,
          SolarGlobalSearch(
            placeholder: 'Search Workplace',
            shortcut: '⌘K',
            onPressed: () => opened++,
          ),
        );
        expect(
          tester.getSemantics(find.byType(SolarGlobalSearch)),
          matchesSemantics(
            label: 'Search Workplace',
            isButton: true,
            hasTapAction: true,
            hasFocusAction: true,
            isEnabled: true,
            hasEnabledState: true,
            isFocusable: true,
          ),
        );
        await tester.tap(find.byType(SolarGlobalSearch));
        expect(opened, 1);
        handle.dispose();
      },
    );

    testWidgets(
      'shows the query in its placeholder’s place, and a Kbd only with a shortcut',
      (tester) async {
        await pump(
          tester,
          SolarGlobalSearch(query: 'Room 4', onPressed: () {}),
        );
        expect(find.text('Room 4'), findsOneWidget);
        expect(find.text('Search'), findsNothing);
        expect(find.byType(SolarKbd), findsNothing);
      },
    );
  });
}
