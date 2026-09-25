import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

/// SolarEventRow, named as the web case is: Figma's words and its leading Avatar (md, initials),
/// a More menu, pressable so a hover and a focus are forced through [states]; as wide as Figma
/// draws it.
Widget buildEventRow(
  Map<String, dynamic> _,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) => SizedBox(
  width: 520,
  child: SolarEventRow(
    leading: const SolarAvatar(
      size: SolarAvatarSize.md,
      type: SolarAvatarType.text,
      name: 'Dana Scully',
    ),
    title: 'Event name',
    product: 'PRODUCT',
    meta: 'Context · Context · Context',
    timestamp: 'Just now',
    moreItems: [SolarCardMoreItem(label: 'Details', onSelected: () {})],
    onPressed: () {},
    statesController: states,
  ),
);
