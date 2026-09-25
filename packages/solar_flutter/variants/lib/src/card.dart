import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarCard in one oracle variant, named as the web case is, every slot filled so each look is
/// measured: Figma's title, helper, description and Tag words, an icon probe, and a More menu;
/// pressable, so a hover is forced through [states]. It is as wide as Figma draws it.
Widget buildCard(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SizedBox(
    width: 320,
    child: SolarCard(
      status: enumNamed(SolarCardStatus.values, props['status'] as String),
      disabled: props['disabled'] as bool,
      loading: props['loading'] as bool,
      title: 'Label',
      icon: const IconProbe(),
      helper: 'Helper',
      description: 'Content goes here. Replace this with any content — text, lists, form fields, or',
      tag: 'Label',
      moreItems: [SolarCardMoreItem(label: 'Edit', onSelected: () {})],
      onPressed: () {},
      statesController: states,
    ),
  );
}
