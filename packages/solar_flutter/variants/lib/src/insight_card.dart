import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarInsightCard in one oracle variant, named as the web case is: Figma's words, a More menu,
/// pressable so a hover is forced through [states]; as wide as Figma draws it.
Widget buildInsightCard(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SizedBox(
    width: 320,
    child: SolarInsightCard(
      severity: enumNamed(
        SolarInsightCardSeverity.values,
        props['severity'] as String,
      ),
      selected: props['selected'] as bool,
      loading: props['loading'] as bool,
      title: 'Label',
      description: 'Description goes here',
      moreItems: [SolarCardMoreItem(label: 'Dismiss', onSelected: () {})],
      onPressed: () {},
      statesController: states,
    ),
  );
}
