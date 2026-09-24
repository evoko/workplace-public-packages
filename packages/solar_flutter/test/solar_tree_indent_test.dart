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
  group('SolarTreeIndent', () {
    testWidgets('is 16px of indent per level, and none at depth 00', (
      tester,
    ) async {
      await pump(
        tester,
        const SolarTreeIndent(depth: SolarTreeIndentDepth.$03),
      );
      expect(
        tester.getSize(find.byKey(const Key('treeIndent.root'))).width,
        48,
      );
      await pump(tester, const SolarTreeIndent());
      expect(tester.getSize(find.byKey(const Key('treeIndent.root'))).width, 0);
    });
  });
}
