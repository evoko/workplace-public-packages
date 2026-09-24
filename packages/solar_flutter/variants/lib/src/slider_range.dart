import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

/// SolarSliderRange in one oracle variant: at the range Figma draws (where its fill starts and
/// ends on the track), in Figma's sample width, which the overlay makes the caller's; forced into a
/// state through [states].
Widget buildSliderRange(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final layers = v['layers'] as Map<String, dynamic>;
  double at(String layer, String cell) =>
      ((layers[layer] as Map<String, dynamic>)[cell] as num).toDouble();
  final track = at('track', 'width');
  return SizedBox(
    width: at('root', 'width'),
    child: SolarSliderRange(
      values: RangeValues(
        at('fill', 'x') / track,
        (at('fill', 'x') + at('fill', 'width')) / track,
      ),
      onChanged: (_) {},
      disabled: props['disabled'] as bool,
      semanticLabels: ('Lowest price', 'Highest price'),
      statesController: states,
    ),
  );
}
