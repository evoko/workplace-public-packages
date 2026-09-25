/// SOLAR Table.
///
/// Written by hand, and never regenerated; its layer tree is the IR's, [SolarTableRecipe.tree].
/// What it looks like is not here. That is the recipe, [SolarTableRecipe]: the edge along its foot
/// and its mobile fade, read cell by cell.
///
/// A data table's chassis, drawn from Figma's layer tree with [SolarLayers]: its [header], a
/// SolarRow of type title holding the header cells, and its [rows] (the caller's SolarRows). It
/// tells its rows whether they draw their select and expand cells ([selectable], [expandable]),
/// so the caller sets them once; a row in it is a row to a screen reader. The [breakpoint] is the
/// app's to give (owner decision 2026-09-25): on mobile the table draws Figma's fade at its right
/// edge. Sorting, selection and which rows a group shows are the caller's. Compose it with a
/// SolarTableHeader above and a SolarTableFooter below.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';

import '../generated/components/table.dart';
import '../solar_layers.dart';
import '../solar_table.dart';
import 'solar_theme_of.dart';

class SolarTable extends StatelessWidget {
  const SolarTable({
    super.key,
    this.breakpoint = SolarTableBreakpoint.desktop,
    this.expandable = false,
    this.selectable = false,
    this.header,
    this.rows = const [],
  });

  final SolarTableBreakpoint breakpoint;
  final bool expandable;
  final bool selectable;

  /// The header row: a SolarRow of type title, its cells the table's column headers.
  final Widget? header;

  /// The rows: SolarRows, one for each item of the caller's data.
  final List<Widget> rows;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarTableProps(
      breakpoint: breakpoint,
      expandable: expandable,
      selectable: selectable,
    );
    const states = <WidgetState>{};
    final drawn = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarTableRecipe.lookup(c, p, states),
        dimension: (c) => SolarTableRecipe.dimension(c, p, states),
        color: (c) => SolarTableRecipe.color(t, c, p, states),
        shadow: (c) => SolarTableRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarTableRecipe.textStyle(t, c, p, states),
        present: (l) => l == 'header'
            ? header != null
            : SolarTableRecipe.present(l, p, states),
        glyph: (_) => null,
        gradient: (c) => SolarTableRecipe.gradient(t, c, p, states),
      ),
      tree: SolarTableRecipe.tree,
      keyPrefix: 'table',
      composed: {'header': ?header},
      content: {'rows': rows},
      // The fade is drawn over the rows, and takes no pointer.
      builders: {
        'dimming': (layer) =>
            IgnorePointer(child: ExcludeSemantics(child: layer)),
      },
    ).layer('root');
    return Semantics(
      role: SemanticsRole.table,
      container: true,
      child: SolarTableScope(
        selectable: selectable,
        expandable: expandable,
        child: drawn,
      ),
    );
  }
}
