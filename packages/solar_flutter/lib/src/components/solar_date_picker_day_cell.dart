/// SOLAR Date Picker Day Cell.
///
/// Written by hand, and never regenerated; its layer tree is the IR's,
/// [SolarDatePickerDayCellRecipe.tree]. What it looks like is not here. That is the recipe,
/// [SolarDatePickerDayCellRecipe]: the day’s fill, edge and ink by state and range role, read cell
/// by cell.
///
/// Bespoke: one day of a SolarDatePickerOpen's grid, drawn from Figma's layer tree with
/// [SolarLayers], pressable and focusable, announced selected, and named by [semanticLabel], the
/// whole date. Its words are the day of the month. [rangeRole] draws its part of a range as Figma
/// draws one, though the pickers choose one date for now.
library;

import 'package:flutter/material.dart';

import '../generated/components/date_picker_day_cell.dart';
import '../solar_layers.dart';
import '../solar_states.dart';
import 'solar_theme_of.dart';

class SolarDatePickerDayCell extends StatelessWidget {
  const SolarDatePickerDayCell({
    super.key,
    this.selected = false,
    this.today = false,
    this.filled = false,
    this.error = false,
    this.rangeRole = SolarDatePickerDayCellRangeRole.none,
    required this.label,
    required this.onPressed,
    this.semanticLabel,
    this.focusNode,
    this.statesController,
  });

  final bool selected;
  final bool today;
  final bool filled;
  final bool error;
  final SolarDatePickerDayCellRangeRole rangeRole;

  /// The day of the month.
  final String label;

  /// Called when it is chosen; null draws it as it is, not pressable.
  final VoidCallback? onPressed;

  /// The whole date, for a screen reader.
  final String? semanticLabel;

  /// Its focus, which the grid moves with the arrow keys.
  final FocusNode? focusNode;

  /// Whether it is disabled: by a null [onPressed], as Flutter's own controls are, not a
  /// parameter of its own.
  bool get disabled => onPressed == null;

  /// Its states, where the caller keeps them.
  final WidgetStatesController? statesController;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarDatePickerDayCellProps(
      selected: selected,
      today: today,
      disabled: disabled,
      filled: filled,
      error: error,
      rangeRole: rangeRole,
    );
    Widget draw(Set<WidgetState> states) => SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarDatePickerDayCellRecipe.lookup(c, p, states),
        dimension: (c) => SolarDatePickerDayCellRecipe.dimension(c, p, states),
        color: (c) => SolarDatePickerDayCellRecipe.color(t, c, p, states),
        shadow: (c) => SolarDatePickerDayCellRecipe.shadow(t, c, p, states),
        textStyle: (c) =>
            SolarDatePickerDayCellRecipe.textStyle(t, c, p, states),
        present: (l) => SolarDatePickerDayCellRecipe.present(l, p, states),
        glyph: (_) => null,
      ),
      tree: SolarDatePickerDayCellRecipe.tree,
      keyPrefix: 'datePickerDayCell',
      text: {'day': label},
      builders: {
        if (semanticLabel != null)
          'day': (layer) => ExcludeSemantics(child: layer),
      },
    ).layer('root');
    final mark = SolarPressable(
      onPressed: disabled ? null : onPressed,
      statesController: statesController,
      focusNode: focusNode,
      selected: selected,
      target: false,
      builder: (_, states) => draw(states),
    );
    return semanticLabel == null
        ? mark
        : Semantics(label: semanticLabel, child: mark);
  }
}
