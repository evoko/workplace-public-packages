import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarToast in one oracle variant, every slot filled so each look is measured: the Tag with
/// Figma's words, the message, and the action with its chevron. It has no states.
Widget buildToast(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarToast(
    status: enumNamed(SolarToastStatus.values, props['status'] as String),
    tag: 'Label',
    message: 'Message goes here',
    action: 'Action',
    onAction: () {},
    chevron: true,
  );
}
