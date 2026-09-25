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

/// A button's drawn face, not its tap target, which Material pads to 48.
Rect face(WidgetTester tester, String key) => tester.getRect(
  find
      .descendant(of: find.byKey(Key(key)), matching: find.byType(DecoratedBox))
      .first,
);

List<Widget> buttons([SolarButtonSize size = SolarButtonSize.md]) => [
  SolarButton(
    key: const Key('a'),
    onPressed: () {},
    size: size,
    prio: SolarButtonPrio.secondary,
    child: const Text('Cancel'),
  ),
  SolarButton(
    key: const Key('b'),
    onPressed: () {},
    size: size,
    child: const Text('Save'),
  ),
];

void main() {
  group('SolarButtonGroup', () {
    testWidgets('a padded row whose buttons share it equally', (tester) async {
      await pump(tester, SolarButtonGroup(children: buttons()));
      final a = tester.getRect(find.byKey(const Key('a')));
      final b = tester.getRect(find.byKey(const Key('b')));
      expect(a.width, b.width);
      expect(b.left - a.right, SolarInset.xs);
      final group = tester.getRect(find.byType(SolarButtonGroup));
      expect(a.left - group.left, SolarInset.sm);
      expect(group.width, 400);
      expect(face(tester, 'a').height, 40);
    });

    testWidgets('a column whose buttons take its full width', (tester) async {
      await pump(
        tester,
        SolarButtonGroup(
          orientation: SolarButtonGroupOrientation.vertical,
          children: buttons(),
        ),
      );
      final a = tester.getRect(find.byKey(const Key('a')));
      final b = tester.getRect(find.byKey(const Key('b')));
      expect(b.top - a.bottom, SolarInset.xs);
      expect(a.width, 400 - 2 * SolarInset.sm);
    });

    testWidgets('full-width is flush, with a divider along its top only', (
      tester,
    ) async {
      await pump(
        tester,
        SolarButtonGroup(
          type: SolarButtonGroupType.fullWidth,
          children: buttons(SolarButtonSize.lg),
        ),
      );
      final border =
          (tester
                          .widget<DecoratedBox>(
                            find
                                .descendant(
                                  of: find.byType(SolarButtonGroup),
                                  matching: find.byType(DecoratedBox),
                                )
                                .first,
                          )
                          .decoration
                      as BoxDecoration)
                  .border!
              as Border;
      expect(border.top.width, SolarBorder.$default);
      expect(border.top.color, SolarColors.light.borderSubtle);
      expect(border.bottom, BorderSide.none);
      final a = tester.getRect(find.byKey(const Key('a')));
      final b = tester.getRect(find.byKey(const Key('b')));
      expect(b.left, a.right);
      expect(face(tester, 'a').height, 48);
    });

    test('refuses the vertical full-width group Figma does not draw', () {
      expect(
        () => SolarButtonGroup(
          orientation: SolarButtonGroupOrientation.vertical,
          type: SolarButtonGroupType.fullWidth,
          children: const [],
        ),
        throwsAssertionError,
      );
    });
  });
}
