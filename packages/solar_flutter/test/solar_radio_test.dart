import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

Future<void> pump(WidgetTester tester, Widget child) => tester.pumpWidget(
  MaterialApp(
    theme: ThemeData(extensions: const [SolarTheme.light]),
    home: Scaffold(body: Center(child: child)),
  ),
);

Widget radios(String? value, ValueChanged<String?> onChanged) =>
    RadioGroup<String>(
      groupValue: value,
      onChanged: onChanged,
      child: const Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          SolarRadio<String>(key: Key('a'), value: 'a', semanticLabel: 'A'),
          SolarRadio<String>(key: Key('b'), value: 'b', semanticLabel: 'B'),
        ],
      ),
    );

void main() {
  group('SolarRadio', () {
    testWidgets(
      'is checked by its group, and asks the group for its value when tapped',
      (tester) async {
        String? asked;
        await pump(tester, radios('a', (v) => asked = v));
        expect(
          find.descendant(
            of: find.byKey(const Key('a')),
            matching: find.byKey(const Key('radio.icon')),
          ),
          findsOneWidget,
        );
        expect(
          find.descendant(
            of: find.byKey(const Key('b')),
            matching: find.byKey(const Key('radio.icon')),
          ),
          findsNothing,
        );
        await tester.tap(find.byKey(const Key('b')));
        expect(asked, 'b');
      },
    );

    testWidgets('is announced as one of a group, checked or not', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      await pump(tester, radios('a', (_) {}));
      expect(
        tester.getSemantics(find.byKey(const Key('a'))),
        isSemantics(
          label: 'A',
          isInMutuallyExclusiveGroup: true,
          hasCheckedState: true,
          isChecked: true,
          isEnabled: true,
        ),
      );
      expect(
        tester.getSemantics(find.byKey(const Key('b'))),
        isSemantics(
          label: 'B',
          isInMutuallyExclusiveGroup: true,
          hasCheckedState: true,
          isChecked: false,
        ),
      );
      handle.dispose();
    });

    testWidgets('places the dot from the ring’s outer edge, as Figma does', (
      tester,
    ) async {
      await pump(tester, radios('a', (_) {}));
      final ring = tester.getTopLeft(
        find.descendant(
          of: find.byKey(const Key('a')),
          matching: find.byKey(const Key('radio.root')),
        ),
      );
      final dot = tester.getTopLeft(
        find.descendant(
          of: find.byKey(const Key('a')),
          matching: find.byKey(const Key('radio.icon')),
        ),
      );
      expect(dot - ring, const Offset(4, 4));
    });

    testWidgets('is drawn disabled, and does nothing, outside a group', (
      tester,
    ) async {
      await pump(tester, const SolarRadio<String>(value: 'a'));
      await tester.tap(find.byType(SolarRadio<String>));
      expect(find.byKey(const Key('radio.icon')), findsNothing);
    });
  });
}
