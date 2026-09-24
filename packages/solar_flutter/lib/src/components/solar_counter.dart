/// SOLAR Counter.
///
/// Scaffolded once by `npm run solar:scaffold -- --flutter Counter` from
/// spec/components/counter.json, and owned by developers from then on: change it freely. What it
/// looks like is not here. That is the recipe, [SolarCounterRecipe]: the pill’s fill, border and
/// padding, and the count’s text style, by type and state, read cell by cell.
///
/// Bespoke: a count on a pill, drawn from Figma's layer tree with [SolarLayers]. It takes the
/// states of the control it sits in (SolarStatesBuilder), so in a SolarButton it follows the
/// button's hover, press and disabled colours, as Figma draws it; given [onPressed], it is a
/// control of its own. A count of 0 or less draws nothing, and one above [max] reads `<max>+`, as
/// SOLAR says.
library;

import 'package:flutter/material.dart';

import '../generated/components/counter.dart';
import '../solar_layers.dart';
import '../solar_states.dart';
import 'solar_theme_of.dart';

class SolarCounter extends StatelessWidget {
  const SolarCounter({
    super.key,
    this.type = SolarCounterType.regular,
    this.disabled = false,
    required this.count,
    this.max = 99,
    this.onPressed,
    this.statesController,
  });

  final SolarCounterType type;
  final bool disabled;

  /// The count. At 0 or below the counter is not drawn: SOLAR never shows a literal 0.
  final int count;

  /// The largest count shown as a number; above it the counter reads `<max>+`.
  final int max;

  /// Called when it is tapped, which makes it a control of its own; without it, it takes the
  /// states of the control around it (a Button's).
  final VoidCallback? onPressed;

  /// Its states, where the caller keeps them.
  final WidgetStatesController? statesController;

  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
    'root': ['value'],
  };

  @override
  Widget build(BuildContext context) {
    if (count <= 0) return const SizedBox.shrink();
    final t = solarThemeOf(context);
    final p = SolarCounterProps(type: type, disabled: disabled);
    Widget draw(Set<WidgetState> states) => SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarCounterRecipe.lookup(c, p, states),
        dimension: (c) => SolarCounterRecipe.dimension(c, p, states),
        color: (c) => SolarCounterRecipe.color(t, c, p, states),
        shadow: (c) => SolarCounterRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarCounterRecipe.textStyle(t, c, p, states),
        present: (l) => SolarCounterRecipe.present(l, p, states),
        glyph: (_) => null,
      ),
      tree: _tree,
      keyPrefix: 'counter',
      text: {'value': count > max ? '$max+' : '$count'},
    ).layer('root');
    // A control of its own only when it has something to do; otherwise it takes the states of
    // the control around it (a Counter in a Button).
    final mark = onPressed == null && statesController == null
        ? SolarStatesBuilder(builder: (_, states) => draw(states))
        : SolarPressable(
            onPressed: !disabled ? onPressed : null,
            statesController: statesController,
            builder: (_, states) => draw(states),
          );
    return mark;
  }
}
