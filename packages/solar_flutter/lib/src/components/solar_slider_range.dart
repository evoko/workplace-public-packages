/// SOLAR Slider Range.
///
/// Scaffolded once by `npm run solar:scaffold -- --flutter "Slider Range"` from
/// spec/components/slider-range.json, and owned by developers from then on: change it freely. What
/// it looks like is not here. That is the recipe, [SolarSliderRangeRecipe]: the rail, the fill by
/// state, and the handles' size, edge and shadow, read cell by cell.
///
/// A range between two values, both of which matter (a price, a date span): show the two values
/// beside it, as SOLAR asks. For one value, use a Slider. Bespoke: Flutter's RangeSlider paints its
/// own track and thumbs. Figma's layers are drawn with [SolarLayers] over a [SolarSliderInput],
/// which drags, takes the arrow keys and announces each handle as a slider; the value places the
/// fill and handles. On [min] to [max], 0 to 1 by default, as Flutter's is. It fills its container,
/// which must give it a width.
library;

import 'package:flutter/material.dart';

import '../generated/components/slider_range.dart';
import '../solar_layers.dart';
import '../solar_slider_input.dart';
import '../solar_target.dart';
import 'solar_theme_of.dart';

class SolarSliderRange extends StatelessWidget {
  const SolarSliderRange({
    super.key,
    required this.values,
    required this.onChanged,
    this.min = 0,
    this.max = 1,
    this.onChangeStart,
    this.onChangeEnd,
    this.disabled = false,
    this.semanticLabels = const (null, null),
    this.statesController,
  });

  /// The two ends of the range chosen, low first, from [min] to [max].
  final RangeValues values;

  /// Called with the range as a handle moves; null disables it.
  final ValueChanged<RangeValues>? onChanged;

  /// Called with the range when a pointer takes a handle.
  final ValueChanged<RangeValues>? onChangeStart;

  /// Called with the range when the pointer lets it go.
  final ValueChanged<RangeValues>? onChangeEnd;

  /// The lowest value.
  final double min;

  /// The highest value.
  final double max;

  final bool disabled;

  /// What each end sets, low first, for a screen reader.
  final (String?, String?) semanticLabels;

  /// Its states, where the caller keeps them (the visual checks force a state through it).
  final WidgetStatesController? statesController;

  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
    'root': ['track', 'fill', 'handle', 'handle2'],
  };

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final off = disabled || onChanged == null;
    final p = SolarSliderRangeProps(disabled: off);
    final span = max - min;
    double frac(double v) => span == 0 ? 0 : ((v - min) / span).clamp(0.0, 1.0);
    RangeValues of(List<double> f) =>
        RangeValues(min + f[0] * span, min + f[1] * span);
    final at = [frac(values.start), frac(values.end)];
    return SolarTarget(
      child: SolarSliderInput(
        values: at,
        onChanged: off ? null : (f) => onChanged!(of(f)),
        onChangeStart: onChangeStart == null
            ? null
            : (f) => onChangeStart!(of(f)),
        onChangeEnd: onChangeEnd == null ? null : (f) => onChangeEnd!(of(f)),
        labels: [semanticLabels.$1, semanticLabels.$2],
        valueLabel: (f) => '${(f * 100).round()}%',
        statesController: statesController,
        builder: (context, states, width, handle) {
          // Where the value puts the fill and the handles, which the control decides (the
          // overlay's controlDraws), and the width it is given; the recipe says the rest.
          double half(String h) =>
              (SolarSliderRangeRecipe.dimension('$h.width', p, states) ?? 0) /
              2;
          double? placed(String cell) => switch (cell) {
            'root.width' || 'track.width' => width,
            'fill.x' => at[0] * width,
            'fill.width' => (at[1] - at[0]) * width,
            'handle.x' => at[0] * width - half('handle'),
            'handle2.x' => at[1] * width - half('handle2'),
            _ => null,
          };
          return SolarLayers(
            recipe: SolarLayerRecipe(
              lookup: (c) => placed(c) == null
                  ? SolarSliderRangeRecipe.lookup(c, p, states)
                  : 'px:placed',
              dimension: (c) =>
                  placed(c) ?? SolarSliderRangeRecipe.dimension(c, p, states),
              color: (c) => SolarSliderRangeRecipe.color(t, c, p, states),
              shadow: (c) => SolarSliderRangeRecipe.shadow(t, c, p, states),
              textStyle: (c) =>
                  SolarSliderRangeRecipe.textStyle(t, c, p, states),
              present: (l) => SolarSliderRangeRecipe.present(l, p, states),
              glyph: (_) => null,
            ),
            tree: _tree,
            keyPrefix: 'sliderRange',
            builders: {
              'handle': (drawn) => handle(0, drawn),
              'handle2': (drawn) => handle(1, drawn),
            },
          ).layer('root');
        },
      ),
    );
  }
}
