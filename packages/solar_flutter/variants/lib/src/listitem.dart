import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarListItem in one oracle variant, named as the web case is, every slot filled so its look is
/// measured: an icon probe, or the Avatar Figma draws in an avatar row (a logo, a picture probe),
/// the second line and a trailing icon probe; given onPressed, so a hover or focus is forced
/// through [states].
Widget buildListItem(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  // An avatar row is one given an avatar (the oracle's content).
  final content = ((v['content'] as List?) ?? const []).cast<String>();
  return SolarListItem(
    selected: props['selected'] as bool,
    disabled: props['disabled'] as bool,
    compact: props['compact'] as bool,
    label: 'Label',
    helper: 'Supporting text',
    icon: const IconProbe(),
    avatar: content.contains('avatar')
        ? SolarAvatar(
            size: SolarAvatarSize.md,
            type: SolarAvatarType.logo,
            name: 'Biamp',
            image: pictureProbe,
          )
        : null,
    trailing: const IconProbe(),
    onPressed: () {},
    statesController: states,
  );
}
