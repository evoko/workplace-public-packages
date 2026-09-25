import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarStatusCard in one oracle variant, named as the web case is: Figma's title and figure, a
/// More menu, pressable so a hover is forced through [states]; as wide as Figma draws it.
Widget buildStatusCard(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SizedBox(
    width: 240,
    child: SolarStatusCard(
      status: enumNamed(
        SolarStatusCardStatus.values,
        props['status'] as String,
      ),
      disabled: props['disabled'] as bool,
      loading: props['loading'] as bool,
      title: 'Label',
      value: '5',
      moreItems: [SolarCardMoreItem(label: 'Edit', onSelected: () {})],
      onPressed: () {},
      statesController: states,
    ),
  );
}
