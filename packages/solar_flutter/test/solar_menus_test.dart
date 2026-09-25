import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

Future<void> pump(WidgetTester tester, Widget child) => tester.pumpWidget(
  MaterialApp(
    theme: ThemeData(extensions: const [SolarTheme.light]),
    home: Scaffold(body: Center(child: child)),
  ),
);

/// A row that says the size its menu gives it.
class SizeProbe extends StatelessWidget {
  const SizeProbe({super.key});

  @override
  Widget build(BuildContext context) => Text(
    SolarMenuScope.sizeOf(context, SolarDropdownItemSize.values)?.name ??
        'none',
  );
}

void main() {
  group('SolarDropdownMenu', () {
    testWidgets('is a menu whose rows take its size', (tester) async {
      final handle = tester.ensureSemantics();
      await pump(
        tester,
        SolarDropdownMenu(
          size: SolarDropdownMenuSize.sm,
          children: [
            const SolarDropdownGroupLabel(label: 'Recent'),
            SolarDropdownItem(label: 'Name', onPressed: () {}),
            const SizeProbe(),
          ],
        ),
      );
      expect(find.text('sm'), findsOneWidget);
      expect(
        tester.getSemantics(find.text('Name')).getSemanticsData().role,
        SemanticsRole.menuItem,
      );
      handle.dispose();
    });

    testWidgets('moves the focus from row to row with the arrow keys', (
      tester,
    ) async {
      final chosen = <String>[];
      await pump(
        tester,
        SolarDropdownMenu(
          children: [
            for (final label in ['Name', 'Date', 'Size'])
              SolarDropdownItem(
                label: label,
                onPressed: () => chosen.add(label),
              ),
          ],
        ),
      );
      // Focus the first row, then move down twice and choose.
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowUp);
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      expect(chosen, ['Size', 'Date']);
    });
  });

  group('SolarMenuAnchor', () {
    testWidgets('floats its menu from its trigger, and Escape closes it', (
      tester,
    ) async {
      await pump(
        tester,
        SolarMenuAnchor(
          menu: SolarDropdownMenu(
            children: [SolarDropdownItem(label: 'Rename', onPressed: () {})],
          ),
          builder: (context, controller) => SolarButton(
            onPressed: () => controller.open(),
            child: const Text('Open'),
          ),
        ),
      );
      expect(find.text('Rename'), findsNothing);
      await tester.tap(find.text('Open'));
      await tester.pumpAndSettle();
      expect(find.text('Rename'), findsOneWidget);
      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();
      expect(find.text('Rename'), findsNothing);
    });
  });

  group('SolarSplitButton', () {
    testWidgets('with items, opens its own menu, and choosing one closes it', (
      tester,
    ) async {
      var saved = 0;
      await pump(
        tester,
        SolarSplitButton(
          label: 'Save',
          onPressed: () {},
          items: [
            SolarSplitButtonItem(label: 'Save as', onSelected: () => saved++),
          ],
        ),
      );
      await tester.tap(find.bySemanticsLabel('More options'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Save as'));
      await tester.pumpAndSettle();
      expect(saved, 1);
      expect(find.text('Save as'), findsNothing);
    });
  });

  group('SolarContextMenuItem', () {
    testWidgets('calls onPressed, and not when disabled; shows its shortcut', (
      tester,
    ) async {
      var copied = 0;
      await pump(
        tester,
        SolarContextMenu(
          children: [
            SolarContextMenuItem(
              label: 'Copy',
              shortcut: '⌘C',
              onPressed: () => copied++,
            ),
            const SolarContextMenuItem(label: 'Paste', onPressed: null),
          ],
        ),
      );
      expect(find.text('⌘C'), findsOneWidget);
      await tester.tap(find.text('Copy'));
      await tester.tap(find.text('Paste'));
      expect(copied, 1);
    });
  });
}
