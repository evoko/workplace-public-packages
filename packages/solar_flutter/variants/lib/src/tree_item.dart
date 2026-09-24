import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarTreeItem in one oracle variant, named as the web case is: every slot filled, so each is
/// measured where the variant shows it (an unchecked checkbox, both icons probes, Figma's success
/// dot, a status Tag, a count and both actions); editing, Figma's words in the rename field. Given
/// onSelect, so a hover or focus is forced through [states].
Widget buildTreeItem(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarTreeItem(
    selected: props['selected'] as bool,
    expanded: props['expanded'] as bool,
    edit: props['edit'] as bool,
    label: 'Label',
    onSelect: () {},
    onExpandedChange: (_) {},
    checked: false,
    onCheckedChange: (_) {},
    leadingIcon: const IconProbe(),
    trailingIcon: const IconProbe(),
    status: SolarStatusIndicatorType.success,
    tag: const SolarTag(label: 'Label', indicator: true),
    count: 3,
    onMore: () {},
    onAdd: () {},
    statesController: states,
  );
}
