import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

/// SolarFileUpload in one oracle variant: Figma's words, its label, its limits, and its file's
/// name where it is filled (the oracle's content), its placeholder otherwise; forced into a state
/// through [states].
Widget buildFileUpload(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final content = ((v['content'] as List?) ?? const []).cast<String>();
  return SizedBox(
    width: 400,
    child: SolarFileUpload(
      enabled: !(props['disabled'] as bool),
      error: props['error'] as bool,
      label: 'Upload a file',
      mandatory: true,
      helper: 'Max 10MB, .jpg .png',
      value: content.contains('value') ? const ['Filename.jpg'] : const [],
      onBrowse: () {},
      onRemove: () {},
      statesController: states,
    ),
  );
}
