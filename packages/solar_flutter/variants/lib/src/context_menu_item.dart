import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarContextMenuItem in one oracle variant, named as the web case is, in a menu as a row always
/// is, with every slot filled: both icons and the shortcut; given onPressed, so a hover or focus
/// is forced through [states].
Widget buildContextMenuItem(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarMenuScope(
    child: Semantics(
      role: SemanticsRole.menu,
      child: SolarContextMenuItem(
        destructive: props['destructive'] as bool,
        label: 'Action',
        leadingIcon: const IconProbe(),
        trailingIcon: const IconProbe(),
        shortcut: '⌘K',
        onPressed: props['disabled'] as bool ? null : () {},
        statesController: states,
      ),
    ),
  );
}
