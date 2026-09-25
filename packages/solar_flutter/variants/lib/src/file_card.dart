import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarFileCard in one oracle variant, named as the web case is: Figma's words, an icon probe for
/// the file's type, a More menu, pressable so its focus is forced through [states]; as wide as
/// Figma draws it.
Widget buildFileCard(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final type = enumNamed(SolarFileCardType.values, props['type'] as String);
  return SizedBox(
    width: 308,
    child: SolarFileCard(
      type: type,
      title: type == SolarFileCardType.create ? 'New design' : 'File name',
      meta: 'Edited just now',
      fileIcon: const IconProbe(),
      moreItems: [SolarCardMoreItem(label: 'Rename', onSelected: () {})],
      onPressed: () {},
      statesController: states,
    ),
  );
}
