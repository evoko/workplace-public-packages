import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarDropdownItem in one oracle variant, named as the web case is, in a menu as a row always
/// is, with every slot filled: the checkbox, an icon probe and the second line; given onPressed,
/// so a hover is forced through [states].
Widget buildDropdownItem(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarMenuScope(
    child: Semantics(
      role: SemanticsRole.menu,
      child: SolarDropdownItem(
        size: enumNamed(SolarDropdownItemSize.values, props['size'] as String),
        selected: props['selected'] as bool,
        disabled: props['disabled'] as bool,
        label: 'Label',
        helper: 'Description',
        icon: const IconProbe(),
        checkbox: true,
        onPressed: () {},
        statesController: states,
      ),
    ),
  );
}
