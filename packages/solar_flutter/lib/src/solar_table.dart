import 'package:flutter/material.dart';

/// Marks what is inside a table (a SolarTable's rows): a row draws the table's select and expand
/// cells, and takes the row role, valid only in a table.
///
/// Hand written: the table provides it, and the rows read it.
class SolarTableScope extends InheritedWidget {
  /// Marks [child] as inside a table whose rows are [selectable] and [expandable] or not.
  const SolarTableScope({
    super.key,
    required this.selectable,
    required this.expandable,
    required super.child,
  });

  /// Whether its rows draw the select cell.
  final bool selectable;

  /// Whether its rows draw the expand cell.
  final bool expandable;

  /// The table around [context]; null outside one.
  static SolarTableScope? of(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<SolarTableScope>();

  @override
  bool updateShouldNotify(SolarTableScope oldWidget) =>
      selectable != oldWidget.selectable || expandable != oldWidget.expandable;
}

/// Marks what is inside a table's row (a SolarRow's cells): a cell takes the cell or column header
/// role, valid only in a row that is itself in a table.
///
/// Hand written: the row provides it, and the cells read it.
class SolarRowScope extends InheritedWidget {
  /// Marks [child] as inside a row, the header row or not.
  const SolarRowScope({super.key, required this.header, required super.child});

  /// Whether the row is the table's header row.
  final bool header;

  /// The row around [context]; null outside one.
  static SolarRowScope? of(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<SolarRowScope>();

  @override
  bool updateShouldNotify(SolarRowScope oldWidget) =>
      header != oldWidget.header;
}

/// [child], a control in a table's row, as its own target: a row is dense, and SOLAR accepts a
/// control's own box as its target there rather than padding it to 44 × 44 (decided 2026-09-25,
/// for dense rows and pagination), as Material's controls are where the theme shrink-wraps them.
Widget solarDenseTarget(BuildContext context, Widget child) => Theme(
  data: Theme.of(context)
      .copyWith(materialTapTargetSize: MaterialTapTargetSize.shrinkWrap),
  child: child,
);
