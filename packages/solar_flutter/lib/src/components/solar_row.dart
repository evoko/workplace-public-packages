/// SOLAR Row.
///
/// Written by hand, and never regenerated; its layer tree is the IR's, [SolarRowRecipe.tree]. What
/// it looks like is not here. That is the recipe, [SolarRowRecipe]: the row's height and corners,
/// its selected fill and its hover, read cell by cell.
///
/// One row of a Table, drawn from Figma's layer tree with [SolarLayers]: the header row
/// ([SolarRowType.title]), a flat row ([SolarRowType.nonExpandable]), or the top, a middle or the
/// bottom row of a group that expands. Its [cells] are the caller's SolarColumnItems; its select
/// cell (a SolarRowSelect) and expand cell (a SolarRowExpand) are its own, drawn where it is
/// [selectable] and [expandable], as its SolarTable says or, alone, as given. A top row's expand
/// cell is a button that shows or hides its group ([expanded], [onExpandedChanged]); which rows the
/// group shows is the caller's. A selected row ([selected], [onSelectedChanged]) is filled; the
/// header row's select cell selects every row, [mixed] where some are. A row given [onPressed]
/// draws its hover (owner decision 2026-09-25); a keyboard user reaches what it does through its
/// cells. In a SolarTable it is a row to a screen reader, its cells cells.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';

import '../generated/components/row.dart';
import '../generated/components/rowexpand.dart';
import '../solar_layers.dart';
import '../solar_states.dart';
import '../solar_table.dart';
import 'solar_rowexpand.dart';
import 'solar_rowselect.dart';
import 'solar_theme_of.dart';

class SolarRow extends StatefulWidget {
  const SolarRow({
    super.key,
    this.type = SolarRowType.nonExpandable,
    this.selected = false,
    this.selectable,
    this.expandable,
    this.mixed = false,
    this.onSelectedChanged,
    this.selectLabel,
    this.expanded = false,
    this.onExpandedChanged,
    this.expandLabel,
    this.cells = const [],
    this.onPressed,
    this.statesController,
  });

  final SolarRowType type;
  final bool selected;

  /// Whether it draws its select cell; in a SolarTable, the table says.
  final bool? selectable;

  /// Whether it draws its expand cell; in a SolarTable, the table says.
  final bool? expandable;

  /// The header row's select cell, where some rows are selected and some not.
  final bool mixed;

  /// Called with the value its select cell asks for; null disables it.
  final ValueChanged<bool>? onSelectedChanged;

  /// What its select cell selects, for a screen reader.
  final String? selectLabel;

  /// A top row's group, shown.
  final bool expanded;

  /// Called with the value a top row's expand button asks for; null disables it.
  final ValueChanged<bool>? onExpandedChanged;

  /// What its expand button shows or hides, for a screen reader.
  final String? expandLabel;

  /// The row's cells: SolarColumnItems, one a column.
  final List<Widget> cells;

  /// Called when the row is pressed; given, it draws its hover.
  final VoidCallback? onPressed;

  /// Its states, where the caller keeps them (the visual checks force a state through it).
  final WidgetStatesController? statesController;

  @override
  State<SolarRow> createState() => _SolarRowState();
}

class _SolarRowState extends State<SolarRow> {
  WidgetStatesController? _own;
  WidgetStatesController get _states =>
      widget.statesController ?? (_own ??= WidgetStatesController());

  @override
  void dispose() {
    _own?.dispose();
    super.dispose();
  }

  /// The expand cell each type draws: its RowExpand, the chevron's cell or a connector.
  SolarRowExpandType _expandType(SolarRowType type) => switch (type) {
    SolarRowType.title => SolarRowExpandType.titleRow,
    SolarRowType.nonExpandable => SolarRowExpandType.collapsed,
    SolarRowType.top =>
      widget.expanded
          ? SolarRowExpandType.expanded
          : SolarRowExpandType.collapsed,
    SolarRowType.middle => SolarRowExpandType.middleRow,
    SolarRowType.bottom => SolarRowExpandType.bottomRow,
  };

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final w = widget;
    final table = SolarTableScope.of(context);
    final selectable = table?.selectable ?? w.selectable ?? false;
    final expandable = table?.expandable ?? w.expandable ?? false;
    final header = w.type == SolarRowType.title;
    final p = SolarRowProps(type: w.type, selected: w.selected);
    // A cell, in a table, where the role is valid.
    Widget cell(Widget child) => table == null
        ? child
        : Semantics(
            role: header ? SemanticsRole.columnHeader : SemanticsRole.cell,
            container: true,
            child: child,
          );
    final expandCell = SolarRowExpand(
      type: _expandType(w.type),
      chevron: w.type != SolarRowType.nonExpandable,
    );
    final expand = w.type == SolarRowType.top
        ? cell(
            Semantics(
              expanded: w.expanded,
              label: w.expandLabel ?? (w.expanded ? 'Hide rows' : 'Show rows'),
              child: SolarPressable(
                onPressed: w.onExpandedChanged == null
                    ? null
                    : () => w.onExpandedChanged!(!w.expanded),
                builder: (_, _) => expandCell,
              ),
            ),
          )
        : cell(expandCell);
    Widget draw(Set<WidgetState> states) => SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarRowRecipe.lookup(c, p, states),
        dimension: (c) => SolarRowRecipe.dimension(c, p, states),
        color: (c) => SolarRowRecipe.color(t, c, p, states),
        shadow: (c) => SolarRowRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarRowRecipe.textStyle(t, c, p, states),
        // A cell left out is not drawn.
        present: (l) => switch (l) {
          'checkBox' => selectable,
          'expand' => expandable,
          _ => SolarRowRecipe.present(l, p, states),
        },
        glyph: (_) => null,
      ),
      tree: SolarRowRecipe.tree,
      keyPrefix: 'row',
      // Each cell its share of the row, where the recipe fills it, as Figma's cells fill theirs.
      content: {
        'titleRowContent': [
          for (final c in w.cells)
            SolarRowRecipe.lookup('columnItem.width', p, states) == 'k:FILL'
                ? Expanded(child: c)
                : c,
        ],
      },
      composed: {
        'checkBox': SolarRowSelect(
          header: header,
          checked: w.selected,
          mixed: w.mixed,
          onChanged: w.onSelectedChanged,
          label: w.selectLabel,
        ),
        'expand': expand,
      },
    ).layer('root');
    // Hovered only where it is given something to do.
    final pressable = w.onPressed != null;
    final row = MouseRegion(
      cursor: pressable ? SystemMouseCursors.click : MouseCursor.defer,
      onEnter: pressable
          ? (_) => _states.update(WidgetState.hovered, true)
          : null,
      onExit: pressable
          ? (_) => _states.update(WidgetState.hovered, false)
          : null,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: w.onPressed,
        child: ListenableBuilder(
          listenable: _states,
          builder: (_, _) => draw({..._states.value}),
        ),
      ),
    );
    // A row, and its cells cells, only in a table, where the roles are valid.
    if (table == null) return row;
    return Semantics(
      role: SemanticsRole.row,
      container: true,
      child: SolarRowScope(header: header, child: row),
    );
  }
}
