/// SOLAR RowSelect.
///
/// Written by hand, and never regenerated; its layer tree is the IR's, [SolarRowSelectRecipe.tree].
/// What it looks like is not here. That is the recipe, [SolarRowSelectRecipe]: the cell's square
/// and the header's fill, read cell by cell.
///
/// A Table row's select cell, drawn from Figma's layer tree with [SolarLayers]: a SolarCheckbox,
/// centred, that selects its row, or in the header row ([header]) every row: [checked], or [mixed]
/// where some are. It is named for what it selects ([label]). In a SolarRow it is a cell to a
/// screen reader, and its Checkbox its own target, as a dense row's controls are. Whether a row is
/// selected is the caller's; a null [onChanged] disables it, as Flutter's own checkboxes are.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';

import '../generated/components/rowselect.dart';
import '../solar_layers.dart';
import '../solar_table.dart';
import 'solar_checkbox.dart';
import 'solar_theme_of.dart';

class SolarRowSelect extends StatelessWidget {
  const SolarRowSelect({
    super.key,
    this.header = false,
    this.checked = false,
    this.mixed = false,
    required this.onChanged,
    this.label,
  });

  /// Whether it is the header row's cell, which selects every row.
  final bool header;

  /// Whether its row is selected; in the header row, whether every row is.
  final bool checked;

  /// In the header row, where some rows are selected and some not.
  final bool mixed;

  /// Called with the value a tap asks for; null disables it.
  final ValueChanged<bool>? onChanged;

  /// What it selects, for a screen reader: "Select row" or, in the header row, "Select all rows".
  final String? label;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarRowSelectProps(header: header);
    const states = <WidgetState>{};
    final cell = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarRowSelectRecipe.lookup(c, p, states),
        dimension: (c) => SolarRowSelectRecipe.dimension(c, p, states),
        color: (c) => SolarRowSelectRecipe.color(t, c, p, states),
        shadow: (c) => SolarRowSelectRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarRowSelectRecipe.textStyle(t, c, p, states),
        present: (l) => SolarRowSelectRecipe.present(l, p, states),
        glyph: (_) => null,
      ),
      tree: SolarRowSelectRecipe.tree,
      keyPrefix: 'rowSelect',
      composed: {
        // A table row is dense: the Checkbox is its own target.
        'checkbox': solarDenseTarget(
          context,
          SolarCheckbox(
            checked: checked,
            mixed: mixed,
            onChanged: onChanged,
            semanticLabel: label ?? (header ? 'Select all rows' : 'Select row'),
          ),
        ),
      },
    ).layer('root');
    if (SolarRowScope.of(context) == null) return cell;
    return Semantics(
      role: header ? SemanticsRole.columnHeader : SemanticsRole.cell,
      container: true,
      child: cell,
    );
  }
}
