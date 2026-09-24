import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

Future<void> pump(WidgetTester tester, Widget child) => tester.pumpWidget(
  MaterialApp(
    theme: ThemeData(extensions: const [SolarTheme.light]),
    home: Scaffold(body: Center(child: child)),
  ),
);

Color dot(WidgetTester tester) =>
    (tester
                .widget<Container>(
                  find.descendant(
                    of: find.byKey(const Key('dragHandle.col1Dot')),
                    matching: find.byType(Container),
                  ),
                )
                .decoration!
            as BoxDecoration)
        .color!;

void main() {
  group('SolarDragHandle', () {
    testWidgets('is announced as "Reorder", and focusable', (tester) async {
      final handle = tester.ensureSemantics();
      await pump(tester, const SolarDragHandle());
      expect(
        tester.getSemantics(find.byType(SolarDragHandle)),
        isSemantics(label: 'Reorder', isFocusable: true, isEnabled: true),
      );
      handle.dispose();
    });

    testWidgets('is drawn pressed while a pointer holds it, through a drag', (
      tester,
    ) async {
      await pump(tester, const SolarDragHandle());
      final rest = dot(tester);
      final gesture = await tester.startGesture(
        tester.getCenter(find.byType(SolarDragHandle)),
      );
      await gesture.moveBy(const Offset(0, 40));
      await tester.pump();
      expect(dot(tester), SolarColors.light.iconPrimary);
      expect(dot(tester), isNot(rest));
      await gesture.up();
      await tester.pump();
      expect(dot(tester), rest);
    });
  });
}
