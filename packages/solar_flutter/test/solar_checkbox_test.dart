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
  group('SolarCheckbox', () {
    testWidgets(
      'is announced as a checkbox, and asks for the other value when tapped',
      (tester) async {
        final handle = tester.ensureSemantics();
        bool? asked;
        await pump(
          tester,
          SolarCheckbox(
            checked: true,
            onChanged: (v) => asked = v,
            semanticLabel: 'Email me',
          ),
        );
        expect(
          tester.getSemantics(find.byType(SolarCheckbox)),
          matchesSemantics(
            hasCheckedState: true,
            isChecked: true,
            hasEnabledState: true,
            isEnabled: true,
            hasTapAction: true,
            hasFocusAction: true,
            isFocusable: true,
            label: 'Email me',
          ),
        );
        await tester.tap(find.byType(SolarCheckbox));
        expect(asked, false);
        handle.dispose();
      },
    );

    testWidgets('draws the dash where mixed, and announces it mixed', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      await pump(tester, SolarCheckbox(mixed: true, onChanged: (_) {}));
      expect(find.byKey(const Key('checkbox.container')), findsOneWidget);
      expect(find.byKey(const Key('checkbox.icon')), findsNothing);
      expect(
        tester.getSemantics(find.byType(SolarCheckbox)),
        matchesSemantics(
          hasCheckedState: true,
          isCheckStateMixed: true,
          hasEnabledState: true,
          isEnabled: true,
          hasTapAction: true,
          hasFocusAction: true,
          isFocusable: true,
        ),
      );
      handle.dispose();
    });

    testWidgets('is drawn disabled, and inert, with nothing to do', (
      tester,
    ) async {
      await pump(tester, const SolarCheckbox(checked: true, onChanged: null));
      final disabled = tester
          .widget<SolarGlyphView>(
            find.descendant(
              of: find.byKey(const Key('checkbox.icon')),
              matching: find.byType(SolarGlyphView),
            ),
          )
          .fill;
      expect(disabled, SolarColors.light.actionPrimaryIconDisabled);
      expect(find.byKey(const Key('checkbox.root')), findsOneWidget);
      expect(
        tester.getSize(find.byKey(const Key('checkbox.root'))),
        const Size(16, 16),
      );
    });
  });
}
