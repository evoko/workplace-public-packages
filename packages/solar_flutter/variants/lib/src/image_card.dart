import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

/// SolarImageCard in one oracle variant, named as the web case is: Figma's words, selectable, a
/// More menu, pressable so a hover is forced through [states]; as wide as Figma draws it.
Widget buildImageCard(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SizedBox(
    width: 200,
    child: SolarImageCard(
      filled: props['filled'] as bool,
      selected: props['selected'] as bool,
      title: 'Title',
      subtitle: 'Last modified: 2h ago',
      label: 'Create new',
      onSelectedChanged: (_) {},
      moreItems: [SolarCardMoreItem(label: 'Rename', onSelected: () {})],
      onPressed: () {},
      statesController: states,
    ),
  );
}
