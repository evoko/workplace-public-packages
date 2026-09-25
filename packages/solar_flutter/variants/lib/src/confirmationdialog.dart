import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarConfirmationDialog in one oracle variant, named as the web case is: each intent with
/// Figma's words.
Widget buildConfirmationDialog(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarConfirmationDialog(
    intent: enumNamed(
      SolarConfirmationDialogIntent.values,
      props['intent'] as String,
      (i) => i.figma,
    ),
    title: 'Are you sure?',
    description: "This action will apply the changes you've made. You can modify them later.",
    onConfirm: () {},
    onCancel: () {},
  );
}
