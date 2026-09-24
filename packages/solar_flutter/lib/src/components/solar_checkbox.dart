/// SOLAR Checkbox.
///
/// Scaffolded once by `npm run solar:scaffold -- --flutter Checkbox` from
/// spec/components/checkbox.json, and owned by developers from then on: change it freely. What it
/// looks like is not here. That is the recipe, [SolarCheckboxRecipe]: the box’s fill and edge by
/// state, and the tick and dash, Figma’s own outlines, read cell by cell.
///
/// Bespoke: Flutter's Checkbox paints a tick of its own and cannot take Figma's. The box, tick and
/// dash are drawn from Figma's layer tree with [SolarLayers], pressable, and announced as a
/// checkbox. One choice of many, committed on tap. [mixed] draws the dash, for a parent box whose
/// children are partly checked, and is announced so. Name it with [semanticLabel], or a label
/// beside it that toggles it too.
library;

import 'package:flutter/material.dart';

import '../generated/components/checkbox.dart';
import '../solar_layers.dart';
import '../solar_states.dart';
import 'solar_theme_of.dart';

class SolarCheckbox extends StatelessWidget {
  const SolarCheckbox({
    super.key,
    this.checked = false,
    this.disabled = false,
    this.mixed = false,
    required this.onChanged,
    this.semanticLabel,
    this.statesController,
  });

  final bool checked;
  final bool disabled;
  final bool mixed;

  /// Called with the value a tap asks for, the opposite of [checked]; null disables it.
  final ValueChanged<bool>? onChanged;

  /// What it chooses, for a screen reader, where no label beside it says so.
  final String? semanticLabel;

  /// Its states, where the caller keeps them.
  final WidgetStatesController? statesController;

  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
    'root': ['icon', 'container'],
  };

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarCheckboxProps(
      checked: checked || mixed,
      disabled: disabled || onChanged == null,
      mixed: mixed,
    );
    Widget draw(Set<WidgetState> states) => SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarCheckboxRecipe.lookup(c, p, states),
        dimension: (c) => SolarCheckboxRecipe.dimension(c, p, states),
        color: (c) => SolarCheckboxRecipe.color(t, c, p, states),
        shadow: (c) => SolarCheckboxRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarCheckboxRecipe.textStyle(t, c, p, states),
        present: (l) => SolarCheckboxRecipe.present(l, p, states),
        glyph: (l) => SolarCheckboxRecipe.glyph(l, p, states),
      ),
      tree: _tree,
      keyPrefix: 'checkbox',
    ).layer('root');
    final mark = SolarPressable(
      onPressed: disabled || onChanged == null
          ? null
          : () => onChanged!(!checked),
      statesController: statesController,
      checked: checked,
      mixed: mixed,
      builder: (_, states) => draw(states),
    );
    return semanticLabel == null
        ? mark
        : Semantics(label: semanticLabel, child: mark);
  }
}
