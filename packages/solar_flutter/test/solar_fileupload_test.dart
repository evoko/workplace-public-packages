import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

Future<void> pump(WidgetTester tester, Widget child) => tester.pumpWidget(
  MaterialApp(
    theme: ThemeData(extensions: const [SolarTheme.light]),
    home: Scaffold(
      body: Center(child: SizedBox(width: 400, child: child)),
    ),
  ),
);

void main() {
  group('SolarFileUpload', () {
    testWidgets('asks the app to browse, and shows what it chose', (
      tester,
    ) async {
      var browsed = 0;
      await pump(tester, SolarFileUpload(onBrowse: () => browsed++));
      expect(find.text('Select a file…'), findsOneWidget);
      await tester.tap(find.text('Browse'));
      expect(browsed, 1);
      var removed = 0;
      await pump(
        tester,
        SolarFileUpload(
          value: const ['plan.pdf'],
          onBrowse: () => browsed++,
          onRemove: () => removed++,
        ),
      );
      expect(find.text('plan.pdf'), findsOneWidget);
      expect(find.text('Browse'), findsNothing);
      await tester.tap(find.bySemanticsLabel('Remove file'));
      expect(removed, 1);
      await tester.tap(find.bySemanticsLabel('Replace file'));
      expect(browsed, 2);
    });
  });
}
