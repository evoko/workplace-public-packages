import 'package:flutter/gestures.dart';
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

/// The tab the keyboard's focus is in, by its words; null where it is in none.
String? focusedTab() => FocusManager.instance.primaryFocus?.context
    ?.findAncestorWidgetOfExactType<SolarTabItem>()
    ?.label;

/// A strip of three tabs, the one of [value] selected, telling [chosen] of each choice.
Widget strip(
  List<Object?> chosen, {
  String value = 'one',
  SolarTabsSize size = SolarTabsSize.sm,
  bool disabledThree = false,
}) => SolarTabs(
  size: size,
  value: value,
  onChanged: chosen.add,
  children: [
    const SolarTabItem(label: 'One', value: 'one'),
    const SolarTabItem(label: 'Two', value: 'two', count: 4),
    SolarTabItem(
      label: 'Three',
      value: 'three',
      disabled: disabledThree,
      count: 0,
    ),
  ],
);

void main() {
  group('SolarTabs', () {
    testWidgets('is a tab bar of tabs, the one of its value selected', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      await pump(tester, strip([], value: 'two'));
      SemanticsNode tab(String label) => tester.getSemantics(find.text(label));
      for (final label in ['One', 'Two', 'Three']) {
        expect(tab(label).getSemanticsData().role, SemanticsRole.tab);
      }
      expect(tab('Two'), isSemantics(isSelected: true));
      expect(tab('One'), isSemantics(isSelected: false));
      expect(tab('Three'), isSemantics(isSelected: false));
      // The tabs' parent node is the tab bar.
      final bar = tester.getSemantics(find.text('One')).parent!;
      expect(bar.getSemanticsData().role, SemanticsRole.tabBar);
      handle.dispose();
    });

    testWidgets('a tap chooses a tab by its value, and not a disabled one', (
      tester,
    ) async {
      final chosen = <Object?>[];
      await pump(tester, strip(chosen, disabledThree: true));
      // The strip decides: a tap tells it the tab's value; a disabled tab tells it nothing.
      await tester.tap(find.text('Two'));
      await tester.tap(find.text('Three'));
      expect(chosen, ['two']);
    });

    testWidgets('its tabs take its size', (tester) async {
      await pump(tester, strip([], size: SolarTabsSize.sm));
      final sm = tester.getSize(find.byKey(const Key('tabItem.root')).first);
      await pump(tester, strip([], size: SolarTabsSize.md));
      final md = tester.getSize(find.byKey(const Key('tabItem.root')).first);
      expect(md.height, greaterThan(sm.height));
      // The same tab outside a strip, at md, is md's height.
      await pump(tester, const SolarTabItem(label: 'One'));
      expect(tester.getSize(find.byKey(const Key('tabItem.root'))), md);
    });

    testWidgets('the arrows move the focus, and Enter or Space chooses', (
      tester,
    ) async {
      final chosen = <Object?>[];
      await pump(tester, strip(chosen));
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      expect(focusedTab(), 'One');
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      expect(focusedTab(), 'Two');
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      expect(focusedTab(), 'Three');
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowLeft);
      expect(focusedTab(), 'Two');
      // Manual activation: moving the focus chooses nothing.
      expect(chosen, isEmpty);
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      expect(chosen, ['two', 'three']);
    });

    testWidgets('a count draws a counter, and none at 0', (tester) async {
      await pump(tester, strip([]));
      expect(find.byType(SolarCounter), findsOneWidget);
      expect(
        find.descendant(
          of: find.widgetWithText(SolarTabItem, 'Two'),
          matching: find.byType(SolarCounter),
        ),
        findsOneWidget,
      );
    });
  });

  group('SolarTabItem', () {
    testWidgets('outside a strip, is selected and pressed as it says', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      var pressed = 0;
      await pump(
        tester,
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            SolarTabItem(
              label: 'One',
              value: 'one',
              selected: true,
              onPressed: () => pressed++,
            ),
            SolarTabItem(label: 'Two', onPressed: () => pressed++),
          ],
        ),
      );
      SemanticsNode tab(String label) => tester.getSemantics(find.text(label));
      expect(tab('One'), isSemantics(isSelected: true));
      expect(tab('Two'), isSemantics(isSelected: false));
      await tester.tap(find.text('One'));
      await tester.tap(find.text('Two'));
      expect(pressed, 2);
      handle.dispose();
    });
  });

  group('SolarNavItem', () {
    const outline = SizedBox.square(key: Key('outline'), dimension: 20);
    const solid = SizedBox.square(key: Key('solid'), dimension: 20);

    testWidgets('a tap calls onPressed, and selected is announced', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      var pressed = 0;
      await pump(
        tester,
        SolarNavItem(
          label: 'Home',
          expanded: true,
          selected: true,
          iconOutline: outline,
          onPressed: () => pressed++,
        ),
      );
      await tester.tap(find.text('Home'));
      expect(pressed, 1);
      expect(
        tester.getSemantics(find.text('Home')),
        isSemantics(isSelected: true),
      );
      handle.dispose();
    });

    testWidgets('collapsed, draws no words but is named by its label', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      await pump(
        tester,
        SolarNavItem(label: 'Home', iconOutline: outline, onPressed: () {}),
      );
      expect(find.text('Home'), findsNothing);
      expect(find.bySemanticsLabel('Home'), findsOneWidget);
      await pump(
        tester,
        SolarNavItem(
          label: 'Home',
          expanded: true,
          iconOutline: outline,
          onPressed: () {},
        ),
      );
      expect(find.text('Home'), findsOneWidget);
      handle.dispose();
    });

    testWidgets('selected, draws its solid icon; at rest, its outline', (
      tester,
    ) async {
      Widget item({required bool selected, Widget? iconSolid}) => SolarNavItem(
        label: 'Home',
        selected: selected,
        iconOutline: outline,
        iconSolid: iconSolid,
        onPressed: () {},
      );
      await pump(tester, item(selected: true, iconSolid: solid));
      expect(find.byKey(const Key('solid')), findsOneWidget);
      expect(find.byKey(const Key('outline')), findsNothing);
      await pump(tester, item(selected: false, iconSolid: solid));
      expect(find.byKey(const Key('solid')), findsNothing);
      expect(find.byKey(const Key('outline')), findsOneWidget);
      // Selected with no solid icon, the outline stays.
      await pump(tester, item(selected: true));
      expect(find.byKey(const Key('outline')), findsOneWidget);
    });
  });

  group('SolarSectionNavItem', () {
    testWidgets('draws its words and icon; a tap calls onPressed', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      var pressed = 0;
      await pump(
        tester,
        SolarSectionNavItem(
          label: 'Profile',
          selected: true,
          icon: const SizedBox.square(key: Key('icon'), dimension: 20),
          onPressed: () => pressed++,
        ),
      );
      expect(find.byKey(const Key('icon')), findsOneWidget);
      await tester.tap(find.text('Profile'));
      expect(pressed, 1);
      expect(
        tester.getSemantics(find.text('Profile')),
        isSemantics(isSelected: true),
      );
      handle.dispose();
    });

    testWidgets('a disabled one is not pressed', (tester) async {
      var pressed = 0;
      await pump(
        tester,
        SolarSectionNavItem(
          label: 'Profile',
          disabled: true,
          icon: const SizedBox.square(dimension: 20),
          onPressed: () => pressed++,
        ),
      );
      await tester.tap(find.text('Profile'), warnIfMissed: false);
      expect(pressed, 0);
    });
  });

  group('SolarSectionNavGroupHeader', () {
    testWidgets('is a heading of its level, 3 by default, named by its label', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      await pump(tester, const SolarSectionNavGroupHeader(label: 'Account'));
      var data = tester.getSemantics(find.text('Account')).getSemanticsData();
      expect(data.flagsCollection.isHeader, isTrue);
      expect(data.headingLevel, 3);
      expect(data.label, 'Account');
      await pump(
        tester,
        const SolarSectionNavGroupHeader(label: 'Account', level: 2),
      );
      data = tester.getSemantics(find.text('Account')).getSemanticsData();
      expect(data.headingLevel, 2);
      handle.dispose();
    });
  });

  group('SolarBreadcrumbItem', () {
    testWidgets('a link is announced as one, and a tap calls onPressed', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      var pressed = 0;
      await pump(
        tester,
        SolarBreadcrumbItem(label: 'Home', onPressed: () => pressed++),
      );
      expect(
        tester.getSemantics(find.text('Home')),
        isSemantics(isLink: true, label: 'Home'),
      );
      await tester.tap(find.text('Home'));
      expect(pressed, 1);
      handle.dispose();
    });

    testWidgets('the current page is not pressed', (tester) async {
      var pressed = 0;
      await pump(
        tester,
        SolarBreadcrumbItem(
          type: SolarBreadcrumbItemType.current,
          label: 'Here',
          onPressed: () => pressed++,
        ),
      );
      await tester.tap(find.text('Here'), warnIfMissed: false);
      expect(pressed, 0);
    });
  });

  group('SolarBreadcrumbs', () {
    List<SolarBreadcrumbItem> trail(
      List<String> pressed,
      List<String> labels,
    ) => [
      for (final label in labels)
        SolarBreadcrumbItem(label: label, onPressed: () => pressed.add(label)),
    ];

    testWidgets('draws its whole trail, the last as the current page', (
      tester,
    ) async {
      final pressed = <String>[];
      await pump(
        tester,
        SolarBreadcrumbs(children: trail(pressed, ['Home', 'Rooms', 'Lobby'])),
      );
      for (final label in ['Home', 'Rooms', 'Lobby']) {
        expect(find.text(label), findsOneWidget);
      }
      // The last is the current page, drawn fresh, its own onPressed dropped.
      await tester.tap(find.text('Rooms'));
      await tester.tap(find.text('Lobby'), warnIfMissed: false);
      expect(pressed, ['Rooms']);
    });

    testWidgets(
      'past maxItems, an ellipsis stands for the middle, and opens a menu of it',
      (tester) async {
        final pressed = <String>[];
        const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
        await pump(tester, SolarBreadcrumbs(children: trail(pressed, labels)));
        expect(find.text('A'), findsOneWidget);
        expect(find.text('…'), findsOneWidget);
        expect(find.text('G'), findsOneWidget);
        for (final label in labels.sublist(1, 6)) {
          expect(find.text(label), findsNothing);
        }
        await tester.tap(find.text('…'));
        await tester.pumpAndSettle();
        expect(find.byType(SolarDropdownMenu), findsOneWidget);
        for (final label in labels.sublist(1, 6)) {
          expect(
            find.descendant(
              of: find.byType(SolarDropdownMenu),
              matching: find.text(label),
            ),
            findsOneWidget,
          );
        }
        await tester.tap(find.text('D'));
        await tester.pumpAndSettle();
        expect(pressed, ['D']);
      },
    );
  });

  group('SolarTreeItem', () {
    testWidgets('a tap selects it, and its chevron toggles it alone', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      var selected = 0;
      final expanded = <bool>[];
      Widget item({required bool isExpanded}) => SolarTreeItem(
        label: 'Rooms',
        expanded: isExpanded,
        onSelect: () => selected++,
        onExpandedChange: expanded.add,
      );
      await pump(tester, item(isExpanded: false));
      await tester.tap(find.text('Rooms'));
      expect(selected, 1);
      // The chevron is a control of its own: it toggles, and does not select.
      await tester.tap(find.bySemanticsLabel('Expand'));
      expect(expanded, [true]);
      expect(selected, 1);
      await pump(tester, item(isExpanded: true));
      expect(find.bySemanticsLabel('Expand'), findsNothing);
      await tester.tap(find.bySemanticsLabel('Collapse'));
      expect(expanded, [true, false]);
      expect(selected, 1);
      handle.dispose();
    });

    testWidgets('a leaf has no chevron to press', (tester) async {
      final handle = tester.ensureSemantics();
      final expanded = <bool>[];
      await pump(
        tester,
        SolarTreeItem(
          label: 'Lobby',
          expandable: false,
          onExpandedChange: expanded.add,
        ),
      );
      // A leaf keeps the chevron's room, not drawn and not pressable.
      expect(find.bySemanticsLabel('Expand'), findsNothing);
      await tester.tap(
        find.byKey(const Key('treeItem.chevron')),
        warnIfMissed: false,
      );
      expect(expanded, isEmpty);
      handle.dispose();
    });

    testWidgets('the right and left arrows expand and collapse it', (
      tester,
    ) async {
      final expanded = <bool>[];
      Widget item({required bool isExpanded}) => SolarTreeItem(
        label: 'Rooms',
        expanded: isExpanded,
        onExpandedChange: expanded.add,
      );
      await pump(tester, item(isExpanded: false));
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      // Collapsed, left does nothing; right expands.
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowLeft);
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      expect(expanded, [true]);
      await pump(tester, item(isExpanded: true));
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowLeft);
      expect(expanded, [true, false]);
    });

    testWidgets('checked draws a checkbox, and count a counter', (
      tester,
    ) async {
      final checked = <bool>[];
      await pump(
        tester,
        SolarTreeItem(
          label: 'Rooms',
          checked: false,
          onCheckedChange: checked.add,
          count: 3,
        ),
      );
      expect(find.byType(SolarCounter), findsOneWidget);
      await tester.tap(find.byType(SolarCheckbox));
      expect(checked, [true]);
    });

    testWidgets(
      'its actions show while selected or hovered, not at rest; Add adds',
      (tester) async {
        final handle = tester.ensureSemantics();
        final actions = <String>[];
        Widget item({required bool selected}) => SolarTreeItem(
          label: 'Rooms',
          selected: selected,
          onMore: () => actions.add('more'),
          onAdd: () => actions.add('add'),
        );
        await pump(tester, item(selected: false));
        expect(find.bySemanticsLabel('More actions'), findsNothing);
        expect(find.bySemanticsLabel('Add'), findsNothing);
        // Hovered, they show: with a mouse, as on a desktop, where hover is drawn.
        FocusManager.instance.highlightStrategy =
            FocusHighlightStrategy.alwaysTraditional;
        addTearDown(
          () => FocusManager.instance.highlightStrategy =
              FocusHighlightStrategy.automatic,
        );
        final mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
        await mouse.addPointer(location: Offset.zero);
        await mouse.moveTo(tester.getCenter(find.text('Rooms')));
        await tester.pump();
        expect(find.bySemanticsLabel('More actions'), findsOneWidget);
        await mouse.moveTo(Offset.zero);
        await tester.pump();
        expect(find.bySemanticsLabel('More actions'), findsNothing);
        await mouse.removePointer();
        await pump(tester, item(selected: true));
        expect(find.bySemanticsLabel('More actions'), findsOneWidget);
        await tester.tap(find.bySemanticsLabel('Add'));
        expect(actions, ['add']);
        // Each action's own box is its target: a tap on More is More's, not its neighbour's.
        await tester.tap(find.bySemanticsLabel('More actions'));
        expect(actions, ['add', 'more']);
        handle.dispose();
      },
    );

    testWidgets('editing, submitting renames it and Escape cancels', (
      tester,
    ) async {
      final renamed = <String>[];
      var cancelled = 0;
      await pump(
        tester,
        SolarTreeItem(
          label: 'Rooms',
          edit: true,
          onRename: renamed.add,
          onRenameCancel: () => cancelled++,
        ),
      );
      final field = find.byType(TextField);
      expect(field, findsOneWidget);
      expect(tester.widget<TextField>(field).controller!.text, 'Rooms');
      // Escape first, while the field has the focus submitting takes from it.
      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      expect(cancelled, 1);
      await tester.enterText(field, 'Halls');
      await tester.testTextInput.receiveAction(TextInputAction.done);
      expect(renamed, ['Halls']);
    });

    testWidgets('its depth sets its indent', (tester) async {
      await pump(tester, const SolarTreeItem(label: 'Rooms', depth: 3));
      expect(
        tester.widget<SolarTreeIndent>(find.byType(SolarTreeIndent)).depth,
        SolarTreeIndentDepth.$03,
      );
    });
  });
}
