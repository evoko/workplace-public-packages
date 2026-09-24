import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

/// SolarSlider in one oracle variant: at the value Figma draws (its fill's share of the track), in
/// Figma's sample width, which the overlay makes the caller's; forced into a state through
/// [states].
Widget buildSlider(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final layers = v['layers'] as Map<String, dynamic>;
  double at(String layer, String cell) =>
      ((layers[layer] as Map<String, dynamic>)[cell] as num).toDouble();
  return SizedBox(
    width: at('root', 'width'),
    child: SolarSlider(
      value: at('fill', 'width') / at('track', 'width'),
      onChanged: (_) {},
      disabled: props['disabled'] as bool,
      filled: props['filled'] as bool,
      error: props['error'] as bool,
      semanticLabel: 'Volume',
      statesController: states,
    ),
  );
}
