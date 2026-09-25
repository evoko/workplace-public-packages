import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

Future<void> pump(WidgetTester tester, Widget child) => tester.pumpWidget(
  MaterialApp(
    theme: ThemeData(extensions: const [SolarTheme.light]),
    home: Scaffold(
      body: Center(child: SizedBox(width: 720, child: child)),
    ),
  ),
);

List<Widget> cells(bool header) => [
  for (final words in ['Name', 'Status'])
    SolarColumnItem(header: header, label: words),
];

/// Whether a semantics node, or one under it, has the role.
bool hasRole(SemanticsNode node, SemanticsRole role) {
  if (node.getSemanticsData().role == role) return true;
  var found = false;
  node.visitChildren((c) {
    found = hasRole(c, role);
    return !found;
  });
  return found;
}

void main() {
  group('SolarTable', () {
    testWidgets('is a table of rows of cells, as Flutter checks its roles', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      await pump(
        tester,
        SolarTable(
          selectable: true,
          header: SolarRow(
            type: SolarRowType.title,
            onSelectedChanged: (_) {},
            cells: cells(true),
          ),
          rows: [SolarRow(onSelectedChanged: (_) {}, cells: cells(false))],
        ),
      );
      // Flutter reports a row outside a table, or a cell outside a row, as an error.
      expect(tester.takeException(), isNull);
      final root = tester.getSemantics(find.byType(SolarTable));
      expect(hasRole(root, SemanticsRole.table), isTrue);
      expect(hasRole(root, SemanticsRole.row), isTrue);
      expect(hasRole(root, SemanticsRole.columnHeader), isTrue);
      expect(hasRole(root, SemanticsRole.cell), isTrue);
      handle.dispose();
    });

    testWidgets('takes no roles outside a table, where none is valid', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      await pump(tester, SolarRow(cells: cells(false)));
      expect(tester.takeException(), isNull);
      final row = tester.getSemantics(find.byType(SolarRow));
      expect(hasRole(row, SemanticsRole.row), isFalse);
      expect(hasRole(row, SemanticsRole.cell), isFalse);
      handle.dispose();
    });

    testWidgets('draws each row’s select and expand cells where it asks', (
      tester,
    ) async {
      await pump(tester, SolarTable(rows: [SolarRow(cells: cells(false))]));
      expect(find.byType(SolarRowSelect), findsNothing);
      expect(find.byType(SolarRowExpand), findsNothing);
      await pump(
        tester,
        SolarTable(
          selectable: true,
          expandable: true,
          rows: [SolarRow(cells: cells(false))],
        ),
      );
      expect(find.byType(SolarRowSelect), findsOneWidget);
      expect(find.byType(SolarRowExpand), findsOneWidget);
    });
  });

  testWidgets(
    'draws the mobile fade the table’s full height, at its right edge',
    (tester) async {
      await pump(
        tester,
        SolarTable(
          breakpoint: SolarTableBreakpoint.mobile,
          rows: [for (var i = 0; i < 3; i++) SolarRow(cells: cells(false))],
        ),
      );
      final table = tester.getRect(find.byType(SolarTable));
      final fade = tester.getRect(find.byKey(const Key('table.dimming')));
      // From the table's top to its bottom edge, inside the edge, as a placed layer sits inside
      // its parent's border on both platforms.
      expect(fade.top, table.top);
      expect(fade.bottom, table.bottom - SolarBorder.$default);
      expect(fade.right, table.right);
      expect(fade.width, 32);
    },
  );

  group('SolarRow', () {
    testWidgets('shows or hides a top row’s group from its expand button', (
      tester,
    ) async {
      bool? asked;
      final handle = tester.ensureSemantics();
      await pump(
        tester,
        SolarRow(
          type: SolarRowType.top,
          expandable: true,
          onExpandedChanged: (v) => asked = v,
          cells: cells(false),
        ),
      );
      expect(
        tester.getSemantics(find.bySemanticsLabel('Show rows')),
        isSemantics(isButton: true, isExpanded: false, hasExpandedState: true),
      );
      await tester.tap(find.byType(SolarRowExpand));
      expect(asked, isTrue);
      handle.dispose();
    });

    testWidgets('selects its row from its select cell', (tester) async {
      bool? asked;
      await pump(
        tester,
        SolarRow(
          selectable: true,
          onSelectedChanged: (v) => asked = v,
          cells: cells(false),
        ),
      );
      await tester.tap(find.byType(SolarCheckbox));
      expect(asked, isTrue);
    });
  });

  group('SolarColumnItem', () {
    testWidgets('sorts where it is a header given onSort, saying which way', (
      tester,
    ) async {
      var sorted = 0;
      final handle = tester.ensureSemantics();
      await pump(
        tester,
        SolarTable(
          header: SolarRow(
            type: SolarRowType.title,
            cells: [
              SolarColumnItem(
                header: true,
                label: 'Name',
                sort: SolarColumnSort.ascending,
                onSort: () => sorted++,
              ),
            ],
          ),
        ),
      );
      expect(tester.takeException(), isNull);
      expect(
        tester.getSemantics(find.text('Name')),
        isSemantics(value: 'sorted ascending'),
      );
      await tester.tap(find.text('Name'));
      expect(sorted, 1);
      handle.dispose();
    });

    testWidgets('keeps a control in a cell at its own size, a dense row', (
      tester,
    ) async {
      await pump(
        tester,
        SolarColumnItem(
          toggle: SolarToggle(onChanged: (_) {}, semanticLabel: 'On'),
        ),
      );
      // The Toggle's 32 × 18 track, not padded to 44 × 44 on a touch platform.
      expect(tester.getSize(find.byType(SolarToggle)), const Size(32, 18));
    });
  });

  group('SolarTableHeader and SolarTableFooter', () {
    testWidgets('draw the search and the Button on desktop alone', (
      tester,
    ) async {
      final search = SolarSearchField(
        size: SolarSearchFieldSize.md,
        controller: TextEditingController(),
        placeholder: 'Search',
      );
      await pump(tester, SolarTableHeader(search: search));
      expect(find.byType(SolarSearchField), findsOneWidget);
      await pump(
        tester,
        SolarTableHeader(
          breakpoint: SolarTableHeaderBreakpoint.mobile,
          search: search,
        ),
      );
      expect(find.byType(SolarSearchField), findsNothing);
      final button = SolarButton(onPressed: () {}, child: const Text('Export'));
      await pump(tester, SolarTableFooter(button: button));
      expect(find.text('Export'), findsOneWidget);
      await pump(
        tester,
        SolarTableFooter(
          breakpoint: SolarTableFooterBreakpoint.mobile,
          button: button,
        ),
      );
      expect(find.text('Export'), findsNothing);
    });
  });

  group('SolarPropertyList', () {
    testWidgets('puts a divider between each two rows, its rows in its look', (
      tester,
    ) async {
      await pump(
        tester,
        const SolarPropertyList(
          inCard: false,
          children: [
            SolarPropertyRow(label: 'Status'),
            SolarPropertyRow(label: 'Serial'),
            SolarPropertyRow(label: 'Firmware'),
          ],
        ),
      );
      expect(find.byType(SolarDivider), findsNWidgets(2));
      final row = find.byType(SolarPropertyRow).first;
      expect(SolarPropertyListScope.inCardOf(tester.element(row)), isFalse);
    });
  });
}
