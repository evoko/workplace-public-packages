import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
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

/// A row inside a menu, as SolarDropdownMenu holds its rows.
Widget inMenu(Widget row) => SolarMenuScope(
  child: Semantics(role: SemanticsRole.menu, child: row),
);

void main() {
  group('SolarDropdownItem', () {
    testWidgets('calls onPressed on a tap, and not when disabled', (
      tester,
    ) async {
      var chosen = 0;
      await pump(
        tester,
        SolarDropdownItem(label: 'Rename', onPressed: () => chosen++),
      );
      await tester.tap(find.text('Rename'));
      expect(chosen, 1);
      await pump(
        tester,
        const SolarDropdownItem(label: 'Rename', onPressed: null),
      );
      await tester.tap(find.text('Rename'));
      expect(chosen, 1);
    });

    testWidgets('is a menu item inside a menu, and a button outside one', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      await pump(
        tester,
        inMenu(SolarDropdownItem(label: 'Rename', onPressed: () {})),
      );
      expect(
        tester.getSemantics(find.text('Rename')).getSemanticsData().role,
        SemanticsRole.menuItem,
      );
      await pump(tester, SolarDropdownItem(label: 'Rename', onPressed: () {}));
      expect(
        tester.getSemantics(find.text('Rename')),
        isSemantics(isButton: true),
      );
      handle.dispose();
    });

    testWidgets('with a checkbox, is a checkable menu item, its box inert', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      await pump(
        tester,
        inMenu(
          SolarDropdownItem(
            label: 'Ada',
            checkbox: true,
            selected: true,
            onPressed: () {},
          ),
        ),
      );
      final node = tester.getSemantics(find.text('Ada'));
      expect(node.getSemanticsData().role, SemanticsRole.menuItemCheckbox);
      expect(node, isSemantics(hasCheckedState: true, isChecked: true));
      final box = tester.widget<SolarCheckbox>(find.byType(SolarCheckbox));
      expect(box.checked, isTrue);
      expect(box.inStates, isNotNull);
      handle.dispose();
    });

    test('a focused row draws the hover', () {
      const p = SolarDropdownItemProps();
      const t = SolarTheme.light;
      expect(
        SolarDropdownItemRecipe.color(t, 'root.background', p, {
          WidgetState.focused,
        }),
        SolarDropdownItemRecipe.color(t, 'root.background', p, {
          WidgetState.hovered,
        }),
      );
      expect(
        SolarDropdownItemRecipe.color(t, 'root.background', p, {}),
        isNot(
          SolarDropdownItemRecipe.color(t, 'root.background', p, {
            WidgetState.focused,
          }),
        ),
      );
    });
  });
}
