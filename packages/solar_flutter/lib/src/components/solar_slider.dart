/// SOLAR Slider.
///
/// Scaffolded once by `npm run solar:scaffold -- --flutter "Slider"` from
/// spec/components/slider.json, and owned by developers from then on: change it freely. What it
/// looks like is not here. That is the recipe, [SolarSliderRecipe]: the rail, the fill by state,
/// and the handle' size, edge and shadow, read cell by cell.
///
/// One value in a continuous range, chosen by eye (a volume, a zoom): for an exact number, pair it
/// with a number input; for a range, use a Slider Range. filled and error are drawn as at rest, as
/// Figma draws them, until SOLAR draws them otherwise; error is not yet announced. Bespoke:
/// Flutter's Slider paints its own track and thumb. Figma's layers are drawn with [SolarLayers]
/// over a [SolarSliderInput], which drags, takes the arrow keys and announces it as a slider; the
/// value places the fill and handle. On [min] to [max], 0 to 1 by default, as Flutter's is. It
/// fills its container, which must give it a width.
library;

import 'package:flutter/material.dart';

import '../generated/components/slider.dart';
import '../solar_layers.dart';
import '../solar_slider_input.dart';
import '../solar_target.dart';
import 'solar_theme_of.dart';

class SolarSlider extends StatelessWidget {
  const SolarSlider({
    super.key,
    required this.value,
    required this.onChanged,
    this.min = 0,
    this.max = 1,
    this.onChangeStart,
    this.onChangeEnd,
    this.disabled = false,
    this.filled = false,
    this.error = false,
    this.semanticLabel,
    this.statesController,
  });

  /// The value chosen, from [min] to [max].
  final double value;

  /// Called with the value as a handle moves; null disables it.
  final ValueChanged<double>? onChanged;

  /// Called with the value when a pointer takes a handle.
  final ValueChanged<double>? onChangeStart;

  /// Called with the value when the pointer lets it go.
  final ValueChanged<double>? onChangeEnd;

  /// The lowest value.
  final double min;

  /// The highest value.
  final double max;

  final bool disabled;
  final bool filled;
  final bool error;

  /// What it sets, for a screen reader.
  final String? semanticLabel;

  /// Its states, where the caller keeps them (the visual checks force a state through it).
  final WidgetStatesController? statesController;

  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
    'root': ['track', 'fill', 'handle'],
  };

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final off = disabled || onChanged == null;
    final p = SolarSliderProps(disabled: off, filled: filled, error: error);
    final span = max - min;
    double frac(double v) => span == 0 ? 0 : ((v - min) / span).clamp(0.0, 1.0);
    double of(List<double> f) => min + f[0] * span;
    final at = [frac(value)];
    return SolarTarget(
      child: SolarSliderInput(
        values: at,
        onChanged: off ? null : (f) => onChanged!(of(f)),
        onChangeStart: onChangeStart == null
            ? null
            : (f) => onChangeStart!(of(f)),
        onChangeEnd: onChangeEnd == null ? null : (f) => onChangeEnd!(of(f)),
        labels: [semanticLabel],
        valueLabel: (f) => '${(f * 100).round()}%',
        statesController: statesController,
        builder: (context, states, width, handle) {
          // Where the value puts the fill and the handle, which the control decides (the
          // overlay's controlDraws), and the width it is given; the recipe says the rest.
          double half(String h) =>
              (SolarSliderRecipe.dimension('$h.width', p, states) ?? 0) / 2;
          double? placed(String cell) => switch (cell) {
            'root.width' || 'track.width' => width,
            'fill.width' => at[0] * width,
            'handle.x' => at[0] * width - half('handle'),
            _ => null,
          };
          return SolarLayers(
            recipe: SolarLayerRecipe(
              lookup: (c) => placed(c) == null
                  ? SolarSliderRecipe.lookup(c, p, states)
                  : 'px:placed',
              dimension: (c) =>
                  placed(c) ?? SolarSliderRecipe.dimension(c, p, states),
              color: (c) => SolarSliderRecipe.color(t, c, p, states),
              shadow: (c) => SolarSliderRecipe.shadow(t, c, p, states),
              textStyle: (c) => SolarSliderRecipe.textStyle(t, c, p, states),
              present: (l) => SolarSliderRecipe.present(l, p, states),
              glyph: (_) => null,
            ),
            tree: _tree,
            keyPrefix: 'slider',
            builders: {'handle': (drawn) => handle(0, drawn)},
          ).layer('root');
        },
      ),
    );
  }
}
