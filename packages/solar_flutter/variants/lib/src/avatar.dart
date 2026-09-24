import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarAvatar in one oracle variant: in the colour Figma samples there (the oracle's `color`), a
/// photo or a logo showing a stand-in picture. It has no states.
Widget buildAvatar(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final hex = props['color'] as String?;
  return SolarAvatar(
    size: enumNamed(SolarAvatarSize.values, props['size'] as String),
    type: enumNamed(SolarAvatarType.values, props['type'] as String),
    color: hex == null
        ? null
        : Color(int.parse('ff${hex.substring(1, 7)}', radix: 16)),
    name: 'Dana Scully',
    image: pictureProbe,
  );
}
