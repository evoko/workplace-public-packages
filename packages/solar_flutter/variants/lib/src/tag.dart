import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarTag in one oracle variant, given what makes Figma's type (the oracle's content): the
/// words, an icon probe, the status dot, or a close button. A tag has no states.
Widget buildTag(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final content = ((v['content'] as List?) ?? const []).cast<String>();
  return SolarTag(
    status: enumNamed(SolarTagStatus.values, props['status'] as String),
    invert: props['invert'] as bool,
    label: content.contains('label') ? 'Label' : null,
    icon: content.contains('icon') ? const IconProbe() : null,
    indicator: content.contains('indicator'),
    onClose: content.contains('onClose') ? () {} : null,
    semanticLabel: content.contains('label') ? null : 'Tag',
  );
}
