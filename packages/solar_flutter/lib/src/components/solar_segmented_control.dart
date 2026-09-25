/// SOLAR Segmented Control.
///
/// Written by hand, and never regenerated; its layer tree is the IR's,
/// [SolarSegmentedControlRecipe.tree]. What it looks like is not here. That is the recipe,
/// [SolarSegmentedControlRecipe]: the track, and the label and helper's text styles, by size, read
/// cell by cell.
///
/// Two to five [SolarSegmentedControlItem]s of its size, one always chosen, committed on tap: a
/// [RadioGroup], which selects the segment whose value is [groupValue], calls [onChanged] with the
/// one tapped, and moves between them with the arrow keys. Its [label] names the group (a
/// [mandatory] one is starred), and its [helper] says more below it. Drawn from Figma's layer tree
/// with [SolarLayers], the track holding the segments. For six or more choices, or for navigation,
/// use tabs; for on and off, a SolarToggle.
library;

import 'package:flutter/material.dart';

import '../generated/components/segmented_control.dart';
import '../solar_layers.dart';
import 'solar_theme_of.dart';

class SolarSegmentedControl<T> extends StatelessWidget {
  const SolarSegmentedControl({
    super.key,
    this.size = SolarSegmentedControlSize.md,
    required this.groupValue,
    required this.onChanged,
    required this.children,
    this.label,
    this.mandatory = false,
    this.helper,
  });

  final SolarSegmentedControlSize size;

  /// The value of the chosen segment.
  final T? groupValue;

  /// Called with the value of the segment chosen.
  final ValueChanged<T?> onChanged;

  /// Two to five SolarSegmentedControlItems, of its size.
  final List<Widget> children;

  /// What the group chooses, above it.
  final String? label;

  /// Whether a choice is required, which stars the label.
  final bool mandatory;

  /// More about the choice, below it.
  final String? helper;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarSegmentedControlProps(size: size);
    const states = <WidgetState>{};
    final drawn = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarSegmentedControlRecipe.lookup(c, p, states),
        dimension: (c) => SolarSegmentedControlRecipe.dimension(c, p, states),
        color: (c) => SolarSegmentedControlRecipe.color(t, c, p, states),
        shadow: (c) => SolarSegmentedControlRecipe.shadow(t, c, p, states),
        textStyle: (c) =>
            SolarSegmentedControlRecipe.textStyle(t, c, p, states),
        // Figma hides the label and helper, which show where the caller gives them.
        present: (l) => switch (l) {
          'label' || 'labelLabel' => label != null,
          'mandatory' => mandatory,
          'helper' => helper != null,
          _ => SolarSegmentedControlRecipe.present(l, p, states),
        },
        glyph: (_) => null,
      ),
      tree: SolarSegmentedControlRecipe.tree,
      keyPrefix: 'segmentedControl',
      text: {'labelLabel': ?label, 'mandatory': '*', 'helper': ?helper},
      content: {'track': children},
      // The track is the group, named by the label.
      builders: {
        'track': (track) =>
            Semantics(container: true, label: label, child: track),
      },
    ).layer('root');
    return RadioGroup<T>(
      groupValue: groupValue,
      onChanged: onChanged,
      child: drawn,
    );
  }
}
