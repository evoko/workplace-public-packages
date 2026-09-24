import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarGlobalSearch in one oracle variant: Figma's words, as the query where it is filled (the
/// oracle's content) and the placeholder otherwise, and Figma's own sample key in its Kbd; forced
/// into a state through [states].
Widget buildGlobalSearch(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final content = ((v['content'] as List?) ?? const []).cast<String>();
  return SolarGlobalSearch(
    size: enumNamed(SolarGlobalSearchSize.values, props['size'] as String),
    error: props['error'] as bool,
    placeholder: 'Search Workplace',
    query: content.contains('query') ? 'Search Workplace' : null,
    shortcut: '⌘K',
    onPressed: () {},
    statesController: states,
  );
}
