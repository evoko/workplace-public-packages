import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarSearchField in one oracle variant: Figma's words, holding them where it is filled (the
/// oracle's content) and showing them as the placeholder otherwise; the filter an icon probe;
/// forced into a state through [states].
Widget buildSearchField(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final content = ((v['content'] as List?) ?? const []).cast<String>();
  return SolarSearchField(
    size: enumNamed(SolarSearchFieldSize.values, props['size'] as String),
    enabled: !(props['disabled'] as bool),
    error: props['error'] as bool,
    filter: const IconProbe(),
    controller: TextEditingController(
      text: content.contains('value') ? 'Search' : '',
    ),
    placeholder: 'Search',
    statesController: states,
  );
}
